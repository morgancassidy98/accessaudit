import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { getAuthenticatedUserId, getOwnedAudit } from '@/lib/ownership';

// GET /api/audits/[id] — get single audit with pages and results
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const audit = await prisma.audit.findFirst({
      where: { id, userId },
      include: {
        pages: {
          orderBy: { sortOrder: 'asc' },
          include: {
            results: true,
          },
        },
      },
    });

    if (!audit) {
      return NextResponse.json(
        { error: 'Audit not found' },
        { status: 404 }
      );
    }

    // Add stats per page
    const pagesWithStats = audit.pages.map((page) => {
      const passed = page.results.filter((r) => r.status === 'pass').length;
      const failed = page.results.filter((r) => r.status === 'fail').length;
      const na = page.results.filter((r) => r.status === 'na').length;
      const untested = wcagCriteria.length - passed - failed - na;
      const tested = passed + failed + na;
      const passRate = tested > 0 ? Math.round((passed / tested) * 100) : 0;

      return {
        ...page,
        stats: { passed, failed, na, untested, tested, passRate },
      };
    });

    return NextResponse.json({ ...audit, pages: pagesWithStats });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audit' },
      { status: 500 }
    );
  }
}

// PUT /api/audits/[id] — update audit name or url
export async function PUT(
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
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Audit name and URL are required' }, { status: 400 });
    }

    const input = body as { name?: unknown; url?: unknown };
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const url = typeof input.url === 'string' ? input.url.trim() : '';
    if (!name || !url) {
      return NextResponse.json({ error: 'Audit name and URL are required' }, { status: 400 });
    }

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: 'Please provide a valid HTTP or HTTPS URL' }, { status: 400 });
    }

    const audit = await prisma.audit.update({
      where: { id },
      data: { name, url },
    });

    return NextResponse.json(audit);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update audit' },
      { status: 500 }
    );
  }
}

// DELETE /api/audits/[id] — delete audit and all pages/results
export async function DELETE(
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

    await prisma.audit.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete audit' },
      { status: 500 }
    );
  }
}