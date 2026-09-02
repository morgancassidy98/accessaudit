import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { createReadableAuditId } from '@/lib/readable-id';
import { getAuthenticatedUserId, getOwnedAudit } from '@/lib/ownership';

// GET /api/audits/[id]/pages — list pages for an audit
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!await getOwnedAudit(id, userId)) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const pages = await prisma.page.findMany({
      where: { auditId: id },
      orderBy: { createdAt: 'asc' },
      include: { results: true },
    });

    return NextResponse.json(pages);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

// POST /api/audits/[id]/pages — add a page and seed results
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const audit = await getOwnedAudit(id, userId);
    if (!audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }
    const body: unknown = await request.json().catch(() => null);

    if (body && typeof body === 'object' && 'pages' in body) {
      const pages = (body as { pages?: unknown }).pages;
      if (!Array.isArray(pages) || pages.length === 0 || pages.length > 100) {
        return NextResponse.json(
          { error: 'Select between 1 and 100 pages.' },
          { status: 400 }
        );
      }

      const auditOrigin = new URL(audit.url).origin;
      const pageInputs = pages.map((page) => {
        if (!page || typeof page !== 'object') return null;
        const input = page as { url?: unknown; title?: unknown };
        if (typeof input.url !== 'string' || typeof input.title !== 'string') return null;
        try {
          const pageUrl = new URL(input.url.trim());
          if (!['http:', 'https:'].includes(pageUrl.protocol) || pageUrl.origin !== auditOrigin) return null;
          return { url: pageUrl.toString(), title: input.title.trim() };
        } catch {
          return null;
        }
      });

      if (pageInputs.some((page) => !page || !page.title)) {
        return NextResponse.json(
          { error: 'Each selected page needs a valid same-site URL and title.' },
          { status: 400 }
        );
      }

      const uniquePages = [...new Map(
        pageInputs.filter((page): page is { url: string; title: string } => page !== null)
          .map((page) => [page.url, page])
      ).values()];

      const createdPages = await prisma.$transaction(async (tx) => {
        const [existingPages, existingIds] = await Promise.all([
          tx.page.findMany({ where: { auditId: id }, select: { url: true } }),
          tx.page.findMany({ select: { id: true } }),
        ]);
        const existingUrls = new Set(existingPages.map((page) => page.url));
        const usedIds = existingIds.map((page) => page.id);
        const pagesToCreate = [];

        for (const page of uniquePages) {
          if (existingUrls.has(page.url)) continue;
          const pageId = createReadableAuditId(page.title, usedIds);
          usedIds.push(pageId);
          pagesToCreate.push({ id: pageId, auditId: id, url: page.url, title: page.title });
          existingUrls.add(page.url);
        }

        if (pagesToCreate.length === 0) return [];

        await tx.page.createMany({ data: pagesToCreate });
        await tx.result.createMany({
          data: pagesToCreate.flatMap((page) => wcagCriteria.map((criterion) => ({
            pageId: page.id,
            criterionId: criterion.id,
            status: 'untested',
          }))),
        });

        return pagesToCreate;
      }, { maxWait: 10_000, timeout: 30_000 });

      return NextResponse.json({ created: createdPages.length }, { status: 201 });
    }

    const pageBody = body as { url?: unknown; title?: unknown } | null;
    const url = typeof pageBody?.url === 'string' ? pageBody.url : '';
    const title = typeof pageBody?.title === 'string' ? pageBody.title : '';

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    const existingPageIds = await prisma.page.findMany({
      select: { id: true },
    });

    const readablePageId = createReadableAuditId(title, existingPageIds.map((page) => page.id));

    // Create the page and seed one Result row per WCAG criterion
    const page = await prisma.page.create({
      data: {
        id: readablePageId,
        auditId: id,
        url,
        title,
        results: {
          create: wcagCriteria.map((criterion) => ({
            criterionId: criterion.id,
            status: 'untested',
          })),
        },
      },
      include: { results: true },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    console.error('Failed to create page(s):', error);
    return NextResponse.json(
      {
        error: 'Failed to create page',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}