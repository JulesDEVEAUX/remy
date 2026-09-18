import { describe, expect, it } from 'vitest';
import { generateInviteCode, normalizeInviteCode } from '@/lib/household/invite';

describe('generateInviteCode', () => {
  it('generates an 8-character code using only unambiguous uppercase letters and digits', () => {
    const code = generateInviteCode();
    expect(code).toHaveLength(8);
    expect(code).toMatch(/^[A-HJ-NP-Z2-9]+$/);
  });

  it('generates different codes across calls (extremely unlikely to collide)', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateInviteCode()));
    expect(codes.size).toBe(20);
  });
});

describe('normalizeInviteCode', () => {
  it('trims and uppercases the raw input', () => {
    expect(normalizeInviteCode('  abcd1234  ')).toBe('ABCD1234');
  });

  it('returns an empty string for blank input', () => {
    expect(normalizeInviteCode('   ')).toBe('');
  });
});