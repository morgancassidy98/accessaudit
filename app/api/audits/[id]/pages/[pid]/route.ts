import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId, getOwnedAudit } from '@/lib/ownership';

// DELETE /api/audits/[id]/pages/[pid]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { id, pid } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!await getOwnedAudit(id, userId)) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    await prisma.page.deleteMany({ where: { id: pid, auditId: id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

// PUT /api/audits/[id]/pages/[pid] — update a page title or URL
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { id, pid } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!await getOwnedAudit(id, userId)) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const body: unknown = await request.json().catch(() => null);
    const input = body && typeof body === 'object' ? body as { title?: unknown; url?: unknown } : {};
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const url = typeof input.url === 'string' ? input.url.trim() : '';
    if (!title || !url) {
      return NextResponse.json({ error: 'Page title and URL are required' }, { status: 400 });
    }

    try {
      const parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return NextResponse.json({ error: 'Please provide a valid HTTP or HTTPS URL' }, { status: 400 });
    }

    const page = await prisma.page.findFirst({
      where: { id: pid, auditId: id },
      select: { id: true, url: true },
    });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const updatedPage = await prisma.page.update({
      where: { id: pid },
      data: {
        title,
        url,
        ...(page.url !== url ? {
          lighthouseScore: null,
          lighthouseData: null,
          scannedAt: null,
          w3cErrors: null,
        } : {}),
      },
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error('Failed to update page:', error);
    return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
  }
}