import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';
import { getAuthenticatedUserId, getOwnedAudit } from '@/lib/ownership';
import { parseScanUrl } from '@/lib/scan-validation';

const MAX_CANDIDATES = 100;
const MAX_SITEMAPS = 5;
const MAX_RESPONSE_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 8_000;

const parser = new XMLParser({ ignoreAttributes: true });

type DiscoveryCandidate = {
  url: string;
  title: string;
};

function asArray(value: unknown): Record<string, unknown>[] {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(isRecord) : isRecord(value) ? [value] : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getText(value: unknown): string | null {
  return typeof value === 'string' ? value.trim() : null;
}

function candidateTitle(url: string): string {
  const parsed = new URL(url);
  if (parsed.pathname === '/') return 'Homepage';
  const segment = parsed.pathname.split('/').filter(Boolean).pop() ?? 'Page';
  return decodeURIComponent(segment)
    .replace(/[-_]+/g, ' ')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function addCandidate(
  candidates: Map<string, DiscoveryCandidate>,
  value: string | null,
  origin: string
) {
  if (!value || candidates.size >= MAX_CANDIDATES) return;

  try {
    const url = new URL(value, origin);
    const base = new URL(origin);
    url.hash = '';
    if (url.protocol !== base.protocol || url.host !== base.host) return;
    if (url.pathname.match(/\.(?:css|js|json|xml|txt|pdf|zip|png|jpe?g|gif|svg|webp|ico|woff2?)$/i)) return;
    candidates.set(url.toString(), { url: url.toString(), title: candidateTitle(url.toString()) });
  } catch {
    // Ignore malformed or unsupported links.
  }
}

async function fetchText(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html, application/xml, text/xml, text/plain' },
    });
    if (!response.ok) return null;
    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_RESPONSE_BYTES) return null;
    const text = await response.text();
    return text.length <= MAX_RESPONSE_BYTES ? text : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function sitemapLocations(robots: string | null, origin: string): string[] {
  const locations = (robots?.match(/^sitemap:\s*(\S+)/gim) ?? [])
    .map((line) => line.replace(/^sitemap:\s*/i, '').trim());
  return [...new Set([
    ...locations,
    new URL('/sitemap.xml', origin).toString(),
    new URL('/sitemap_index.xml', origin).toString(),
    new URL('/sitemap.txt', origin).toString(),
  ])].slice(0, MAX_SITEMAPS);
}

function parseSitemap(text: string, origin: string): { urls: string[]; indexes: string[] } {
  try {
    const document = parser.parse(text) as Record<string, unknown>;
    const urlset = isRecord(document.urlset) ? document.urlset : null;
    const sitemapIndex = isRecord(document.sitemapindex) ? document.sitemapindex : null;
    const urls = asArray(urlset?.url)
      .map((item) => getText(item.loc))
      .filter((url): url is string => Boolean(url));
    const indexes = asArray(sitemapIndex?.sitemap)
      .map((item) => getText(item.loc))
      .filter((url): url is string => Boolean(url))
      .map((url) => new URL(url, origin).toString());
    return { urls, indexes };
  } catch {
    return { urls: [], indexes: [] };
  }
}

function discoverHomepageLinks(html: string, origin: string): Map<string, DiscoveryCandidate> {
  const candidates = new Map<string, DiscoveryCandidate>();
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    addCandidate(candidates, match[1], origin);
  }
  return candidates;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getAuthenticatedUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const audit = await getOwnedAudit(id, userId);
    if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

    const origin = parseScanUrl(audit.url);
    if (!origin) {
      return NextResponse.json({ error: 'The audit URL must be a valid public HTTP or HTTPS URL.' }, { status: 400 });
    }

    const base = new URL(origin);
    const candidates = new Map<string, DiscoveryCandidate>();
    addCandidate(candidates, origin, origin);

    const robots = await fetchText(new URL('/robots.txt', origin).toString());
    const sitemapQueue = sitemapLocations(robots, origin);
    let usedSitemap = false;

    for (const sitemapUrl of sitemapQueue) {
      if (candidates.size >= MAX_CANDIDATES) break;
      const sitemapText = await fetchText(sitemapUrl);
      if (!sitemapText) continue;
      const parsed = parseSitemap(sitemapText, origin);
      if (parsed.urls.length || parsed.indexes.length) usedSitemap = true;
      parsed.urls.forEach((url) => addCandidate(candidates, url, origin));
      for (const indexUrl of parsed.indexes.slice(0, MAX_SITEMAPS)) {
        const indexText = await fetchText(indexUrl);
        if (!indexText) continue;
        parseSitemap(indexText, origin).urls.forEach((url) => addCandidate(candidates, url, origin));
      }
    }

    if (!usedSitemap || candidates.size <= 1) {
      const homepage = await fetchText(base.toString());
      if (homepage) {
        for (const [url, candidate] of discoverHomepageLinks(homepage, origin)) {
          candidates.set(url, candidate);
          if (candidates.size >= MAX_CANDIDATES) break;
        }
      }
    }

    const existingPages = await import('@/lib/prisma').then(({ prisma }) => prisma.page.findMany({
      where: { auditId: id },
      select: { url: true },
    }));
    const existingUrls = new Set(existingPages.map((page) => page.url));
    const results = [...candidates.values()].filter((candidate) => !existingUrls.has(candidate.url));

    return NextResponse.json({
      source: usedSitemap ? 'sitemap' : 'homepage',
      candidates: results,
      limit: MAX_CANDIDATES,
    });
  } catch (error) {
    console.error('Failed to discover audit pages:', error);
    return NextResponse.json({ error: 'Unable to discover pages from this website.' }, { status: 502 });
  }
}
