import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/results/[id] — update a single result
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes, severity } = await request.json();

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