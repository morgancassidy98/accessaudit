import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/audits/[id]/pages/[pid]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  try {
    const { pid } = await params;

    await prisma.page.delete({ where: { id: pid } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}