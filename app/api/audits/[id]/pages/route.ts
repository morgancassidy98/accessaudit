import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';

// GET /api/audits/[id]/pages — list pages for an audit
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
    const { url, title } = await request.json();

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    // Create the page and seed one Result row per WCAG criterion
    const page = await prisma.page.create({
      data: {
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
    return NextResponse.json(
      { error: 'Failed to create page' },
      { status: 500 }
    );
  }
}