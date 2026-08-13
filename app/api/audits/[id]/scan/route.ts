import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lighthouseAuditMap } from '@/lib/wcag-criteria';

// POST /api/audits/[id]/scan — run Lighthouse + W3C scan on a page
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { pageId, url } = await request.json();

    // ── Lighthouse via PageSpeed Insights API ──
    const lighthouseRes = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility&strategy=mobile`
    );

    if (!lighthouseRes.ok) {
      return NextResponse.json(
        { error: 'Lighthouse scan failed' },
        { status: 502 }
      );
    }

    const lighthouseData = await lighthouseRes.json();
    const score = Math.round(
      (lighthouseData.lighthouseResult?.categories?.accessibility?.score ?? 0) * 100
    );
    const audits = lighthouseData.lighthouseResult?.audits ?? {};

    // ── W3C HTML Validator ──
    const w3cRes = await fetch(
      `https://validator.w3.org/nu/?doc=${encodeURIComponent(url)}&out=json`,
      { headers: { 'User-Agent': 'AccessAudit/1.0' } }
    );

    const w3cData = w3cRes.ok ? await w3cRes.json() : null;
    const w3cErrors = w3cData?.messages?.filter(
      (m: { type: string }) => m.type === 'error'
    ).length ?? 0;

    // ── Update page with scan results ──
    await prisma.page.update({
      where: { id: pageId },
      data: {
        lighthouseScore: score,
        lighthouseData: JSON.stringify(audits),
        w3cErrors,
        scannedAt: new Date(),
      },
    });

    // ── Map Lighthouse failures to WCAG criteria ──
    const failedAudits = Object.entries(audits)
      .filter(([, audit]: [string, any]) => audit.score !== null && audit.score < 1)
      .map(([auditId]) => auditId);

    // Update results where Lighthouse found issues
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      include: { results: true },
    });

    if (page) {
      for (const auditId of failedAudits) {
        const criterionIds = lighthouseAuditMap[auditId] ?? [];
        for (const criterionId of criterionIds) {
          const result = page.results.find(
            (r) => r.criterionId === criterionId
          );
          if (result && result.status === 'untested') {
            await prisma.result.update({
              where: { id: result.id },
              data: {
                automatedStatus: 'fail',
                automatedSource: 'lighthouse',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      score,
      w3cErrors,
      failedAudits,
      scannedAt: new Date(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Scan failed' },
      { status: 500 }
    );
  }
}