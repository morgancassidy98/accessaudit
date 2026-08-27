import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId } from '@/lib/ownership';

// PUT /api/results/[id] — update a single result
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { status, notes, severity } = await request.json();

    const existingResult = await prisma.result.findFirst({
      where: { id, page: { audit: { userId } } },
      select: { id: true },
    });
    if (!existingResult) return NextResponse.json({ error: 'Result not found' }, { status: 404 });

    const result = await prisma.result.update({
      where: { id },
      data: {
        status,
        notes: notes ?? '',
        severity: severity ?? null,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update result' },
      { status: 500 }
    );
  }
}