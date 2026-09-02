import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { wcagCriteria } from '@/lib/wcag-criteria';
import { createReadableAuditId } from '@/lib/readable-id';
import { randomBytes } from 'node:crypto';

// GET /api/audits — list all audits with summary stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const audits = await prisma.audit.findMany({
      where: { userId: session.user.id },
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
      const passed  = allResults.filter((r) => r.status === 'pass').length;
      const failed  = allResults.filter((r) => r.status === 'fail').length;
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
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, url } = await request.json();

    if (!name || !url) {
      return NextResponse.json(
        { error: 'Name and URL are required' },
        { status: 400 }
      );
    }

    const existingAuditIds = await prisma.audit.findMany({
      select: { id: true },
    });

    const readableId = createReadableAuditId(
      name,
      existingAuditIds.map((audit) => audit.id)
    );

    const audit = await prisma.audit.create({
      data: {
        id: readableId,
        shareToken: randomBytes(32).toString('hex'),
        name,
        url,
        userId: session.user.id,
      },
    });

    return NextResponse.json(audit, { status: 201 });
  } catch (error) {
    console.error('Failed to create audit:', error);
    return NextResponse.json(
      {
        error: 'Failed to create audit',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}