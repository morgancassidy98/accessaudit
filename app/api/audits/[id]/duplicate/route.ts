import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserId, getOwnedAudit } from '@/lib/ownership';
import { createReadableAuditId } from '@/lib/readable-id';
import { randomBytes } from 'node:crypto';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sourceAudit = await getOwnedAudit(id, userId);
    if (!sourceAudit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
    }

    const existingAuditIds = await prisma.audit.findMany({ select: { id: true } });
    const newName = `Copy of ${sourceAudit.name}`;
    const newId = createReadableAuditId(newName, existingAuditIds.map((a) => a.id));

    const result = await prisma.$transaction(async (tx) => {
      const newAudit = await tx.audit.create({
        data: {
          id: newId,
          shareToken: randomBytes(32).toString('hex'),
          name: newName,
          url: sourceAudit.url,
          userId: sourceAudit.userId,
        },
      });

      const sourcePages = await tx.page.findMany({
        where: { auditId: sourceAudit.id },
        include: { results: true },
        orderBy: { sortOrder: 'asc' },
      });

      for (const sourcePage of sourcePages) {
        const newPage = await tx.page.create({
          data: {
            auditId: newAudit.id,
            url: sourcePage.url,
            title: sourcePage.title,
            sortOrder: sourcePage.sortOrder,
            lighthouseScore: sourcePage.lighthouseScore,
            lighthouseData: sourcePage.lighthouseData,
            w3cErrors: sourcePage.w3cErrors,
            scannedAt: sourcePage.scannedAt,
          },
        });

        if (sourcePage.results.length > 0) {
          await tx.result.createMany({
            data: sourcePage.results.map((r) => ({
              pageId: newPage.id,
              criterionId: r.criterionId,
              status: r.status,
              automatedStatus: r.automatedStatus,
              automatedSource: r.automatedSource,
              severity: r.severity,
              notes: r.notes,
            })),
          });
        }
      }

      return newAudit;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to duplicate audit' },
      { status: 500 }
    );
  }
}
