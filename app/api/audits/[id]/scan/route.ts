import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lighthouseAuditMap } from '@/lib/wcag-criteria';

export const maxDuration = 10;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { pageId, url } = await request.json();

    const apiKey = process.env.PAGESPEED_API_KEY ?? process.env.NEXT_PUBLIC_PAGESPEED_API_KEY ?? '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;

    // Strict 9 second timeout to stay under Vercel's 10s limit
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    let lighthouseData = null;
    let score = null;
    let failedAudits: string[] = [];
    let scanError: string | null = null;

    try {
      const lighthouseRes = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeout);

      if (!lighthouseRes.ok) {
        const errorBody = await lighthouseRes.json().catch(() => null);
        const message = errorBody?.error?.message ?? `PageSpeed returned ${lighthouseRes.status}`;
        scanError = message.includes('Quota exceeded') || lighthouseRes.status === 429
          ? 'PageSpeed quota exceeded. Add a valid PAGESPEED_API_KEY to your .env.local (or .env) with billing enabled, then retry. The shared Google quota is exhausted.'
          : message;
        return NextResponse.json({ error: scanError }, { status: lighthouseRes.status });
      }

      const data = await lighthouseRes.json();
      score = Math.round(
        (data.lighthouseResult?.categories?.accessibility?.score ?? 0) * 100
      );
      lighthouseData = data.lighthouseResult?.audits ?? {};

      failedAudits = Object.entries(lighthouseData)
        .filter(([, audit]: [string, any]) => audit.score !== null && audit.score < 1)
        .map(([auditId]) => auditId);
    } catch (err) {
      clearTimeout(timeout);
      scanError = 'Lighthouse scan failed — the page may be blocked or the PageSpeed API is unavailable.';
      return NextResponse.json({ error: scanError }, { status: 502 });
    }

    // Update page with whatever we got
    await prisma.page.update({
      where: { id: pageId },
      data: {
        lighthouseScore: score,
        lighthouseData: lighthouseData ? JSON.stringify(lighthouseData) : null,
        w3cErrors: null,
        scannedAt: new Date(),
      },
    });

    // Map failed Lighthouse audits to WCAG criteria
    if (failedAudits.length > 0) {
      const page = await prisma.page.findUnique({
        where: { id: pageId },
        include: { results: true },
      });

      if (page) {
        for (const auditId of failedAudits) {
          const criterionIds = lighthouseAuditMap[auditId] ?? [];
          for (const criterionId of criterionIds) {
            const result = page.results.find((r) => r.criterionId === criterionId);
            if (result && result.status === 'untested') {
              await prisma.result.update({
                where: { id: result.id },
                data: {
                  status: 'fail',
                  automatedStatus: 'fail',
                  automatedSource: 'lighthouse',
                },
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      score,
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