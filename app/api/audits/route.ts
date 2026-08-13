import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { wcagCriteria } from '@/lib/wcag-criteria';

// GET /api/audits — list all audits with summary stats
export async function GET() {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pages: {
          include: {
            results: true,
          },
        },
      },
    });

    const auditsWithStats = audits.map((audit) => {
      const allResults = audit.pages.flatMap((p) => p.results);
      const totalCriteria = audit.pages.length * wcagCriteria.length;
      const passed = allResults.filter((r) => r.status === 'pass').length;
      const failed = allResults.filter((r) => r.status === 'fail').length;
      const untested = allResults.filter((r) => r.status === 'untested').length;

      return {
        ...audit,
        stats: { totalCriteria, passed, failed, untested },
      };
    });

    return NextResponse.json(auditsWithStats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch audits' },
      { status: 500 }
    );
  }
}

// POST /api/audits — create new audit
export async function POST(request: Request) {
  try {
    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const audit = await prisma.audit.create({
      data: { name, url },
    });

    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create audit' },
      { status: 500 }
    );
  }
}