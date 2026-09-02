export type ScanRequest = {
  pageId: string;
  url: string;
};

export function isScanRequest(value: unknown): value is ScanRequest {
  if (!value || typeof value !== 'object') return false;
  const body = value as Record<string, unknown>;
  return typeof body.pageId === 'string' && typeof body.url === 'string';
}

export function parseScanUrl(value: string): string | null {
  if (value.length > 2048) return null;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();
    const isLocalHost = hostname === 'localhost'
      || hostname.endsWith('.localhost')
      || hostname === '::1'
      || hostname === '0.0.0.0'
      || hostname.startsWith('127.');

    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || isLocalHost) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}
