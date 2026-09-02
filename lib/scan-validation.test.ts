import { describe, expect, it } from 'vitest';
import { isScanRequest, parseScanUrl } from './scan-validation';

describe('isScanRequest', () => {
  it('accepts a request with string pageId and url', () => {
    expect(isScanRequest({ pageId: 'page-1', url: 'https://example.com' })).toBe(true);
  });

  it('rejects missing, empty, and non-object request bodies', () => {
    expect(isScanRequest(null)).toBe(false);
    expect(isScanRequest({ pageId: 'page-1' })).toBe(false);
    expect(isScanRequest({ pageId: 42, url: 'https://example.com' })).toBe(false);
  });
});

describe('parseScanUrl', () => {
  it('normalizes a valid public HTTP URL', () => {
    expect(parseScanUrl('https://example.com/path')).toBe('https://example.com/path');
  });

  it('rejects unsupported protocols and malformed URLs', () => {
    expect(parseScanUrl('ftp://example.com')).toBeNull();
    expect(parseScanUrl('not a url')).toBeNull();
  });

  it('rejects local targets and embedded credentials', () => {
    expect(parseScanUrl('http://localhost:3000')).toBeNull();
    expect(parseScanUrl('http://127.0.0.1')).toBeNull();
    expect(parseScanUrl('https://user:password@example.com')).toBeNull();
  });

  it('rejects URLs longer than 2048 characters', () => {
    expect(parseScanUrl(`https://example.com/${'a'.repeat(2040)}`)).toBeNull();
  });
});
