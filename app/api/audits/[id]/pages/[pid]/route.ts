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