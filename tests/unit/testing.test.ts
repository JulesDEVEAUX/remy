import { describe, expect, it } from 'vitest';
import { isTestEmail } from '@/lib/testing';

describe('isTestEmail', () => {
  it('recognizes an e2e test account email', () => {
    expect(isTestEmail('e2e-courses@remy.test')).toBe(true);
  });

  it('is case-insensitive on the domain', () => {
    expect(isTestEmail('e2e-courses@Remy.Test')).toBe(true);
  });

  it('rejects a real user email', () => {
    expect(isTestEmail('sanetossj3@hotmail.fr')).toBe(false);
  });

  it('rejects a lookalike domain', () => {
    expect(isTestEmail('someone@notremy.test')).toBe(false);
  });

  it('handles a missing email', () => {
    expect(isTestEmail(undefined)).toBe(false);
    expect(isTestEmail(null)).toBe(false);
  });
});