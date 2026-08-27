import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { lighthouseAuditMap } from '@/lib/wcag-criteria';
import { getAuthenticatedUserId } from '@/lib/ownership';

export const maxDuration = 10;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { pageId, url } = await request.json();
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const page = await prisma.page.findFirst({
      where: { id: pageId, auditId: id, audit: { userId } },
      select: { id: true },
    });
    if (!page) return NextResponse.json({ error: 'Page not found' }, { status: 404 });

    const apiKey = process.env.PAGESPEED_API_KEY ?? process.env.NEXT_PUBLIC_PAGESPEED_API_KEY ?? '';
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=accessibility&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;

    // Use a slightly longer timeout than the previous 9s to avoid aborting slow
    // PageSpeed responses while still keeping the request bounded.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
        const reason = errorBody?.error?.errors?.[0]?.reason ?? null;
        scanError = message.includes('Quota exceeded') || lighthouseRes.status === 429
          ? `PageSpeed quota exceeded: ${message}${reason ? ` (${reason})` : ''}. Add a valid PAGESPEED_API_KEY to your .env.local (or .env) with billing enabled, then retry.`
          : `${message}${reason ? ` (${reason})` : ''}`;
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
      const message = err instanceof Error ? err.message : 'Unknown error';
      const isAbort = message === 'This operation was aborted' || err instanceof DOMException && err.name === 'AbortError';
      scanError = isAbort
        ? 'Lighthouse scan timed out after 15 seconds. The page may be slow to load, blocked, or the PageSpeed API may be delayed or unavailable.'
        : `Lighthouse scan failed — the page may be blocked or the PageSpeed API is unavailable. Details: ${message}`;
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


  if (lighthouseData) {
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { results: true },
  });

  if (page) {
    const scoredAudits = Object.entries(lighthouseData)
      .filter(([, audit]: [string, any]) => audit.score !== null)
      .map(([auditId, audit]: [string, any]) => ({
        auditId,
        passed: (audit.score as number) >= 1,
      }));

    for (const { auditId, passed } of scoredAudits) {
      const criterionIds = lighthouseAuditMap[auditId] ?? [];
      for (const criterionId of criterionIds) {
        const result = page.results.find((r) => r.criterionId === criterionId);
        if (result && result.status === 'untested') {
          await prisma.result.update({
            where: { id: result.id },
            data: {
              status: passed ? 'pass' : 'fail',
              automatedStatus: passed ? 'pass' : 'fail',
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