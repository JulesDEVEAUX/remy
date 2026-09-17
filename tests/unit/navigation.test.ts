import { describe, expect, it } from 'vitest';
import { safeRedirectTarget } from '@/lib/navigation';

describe('safeRedirectTarget', () => {
  it('accepts an internal path', () => {
    expect(safeRedirectTarget('/stock/nouveau', '/ingredients')).toBe('/stock/nouveau');
  });

  it('falls back when the value is missing', () => {
    expect(safeRedirectTarget(undefined, '/ingredients')).toBe('/ingredients');
    expect(safeRedirectTarget(null, '/ingredients')).toBe('/ingredients');
    expect(safeRedirectTarget('', '/ingredients')).toBe('/ingredients');
  });

  it('rejects an absolute URL to avoid an open redirect', () => {
    expect(safeRedirectTarget('https://evil.example/phishing', '/ingredients')).toBe('/ingredients');
  });

  it('rejects a protocol-relative URL', () => {
    expect(safeRedirectTarget('//evil.example', '/ingredients')).toBe('/ingredients');
  });

  it('rejects a path with no leading slash', () => {
    expect(safeRedirectTarget('stock/nouveau', '/ingredients')).toBe('/ingredients');
  });
});