import { describe, expect, it } from 'vitest';
import { validateLoginInput, validatePinFormat, validateSignupInput } from '@/lib/auth/validation';

describe('validatePinFormat', () => {
  it('accepts exactly 6 digits', () => {
    expect(validatePinFormat('123456')).toEqual({ ok: true, data: '123456' });
  });

  it('rejects fewer than 6 digits', () => {
    const result = validatePinFormat('12345');
    expect(result.ok).toBe(false);
  });

  it('rejects more than 6 digits', () => {
    const result = validatePinFormat('1234567');
    expect(result.ok).toBe(false);
  });

  it('rejects non-digit characters', () => {
    expect(validatePinFormat('12a456').ok).toBe(false);
    expect(validatePinFormat('123 456').ok).toBe(false);
  });

  it('rejects an empty pin', () => {
    expect(validatePinFormat('').ok).toBe(false);
  });
});

describe('validateLoginInput', () => {
  it('accepts a valid email and pin, trimming the email', () => {
    const result = validateLoginInput({ email: '  toi@exemple.fr  ', pin: '123456' });
    expect(result).toEqual({ ok: true, data: { email: 'toi@exemple.fr', pin: '123456' } });
  });

  it('rejects an empty email', () => {
    const result = validateLoginInput({ email: '   ', pin: '123456' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it('rejects a malformed pin', () => {
    const result = validateLoginInput({ email: 'toi@exemple.fr', pin: '12' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.pin).toBeDefined();
    }
  });
});

describe('validateSignupInput', () => {
  it('accepts matching pins and a valid email, with no invite code', () => {
    const result = validateSignupInput({ email: 'toi@exemple.fr', pin: '123456', pinConfirm: '123456', inviteCode: '' });
    expect(result).toEqual({ ok: true, data: { email: 'toi@exemple.fr', pin: '123456', inviteCode: null } });
  });

  it('rejects mismatched pin confirmation', () => {
    const result = validateSignupInput({
      email: 'toi@exemple.fr',
      pin: '123456',
      pinConfirm: '654321',
      inviteCode: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.pinConfirm).toBeDefined();
    }
  });

  it('reports both pin and confirmation errors when the pin itself is malformed', () => {
    const result = validateSignupInput({ email: 'toi@exemple.fr', pin: '12', pinConfirm: '654321', inviteCode: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.pin).toBeDefined();
      expect(result.errors.pinConfirm).toBeDefined();
    }
  });

  it('rejects an empty email', () => {
    const result = validateSignupInput({ email: '', pin: '123456', pinConfirm: '123456', inviteCode: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
    }
  });

  it('accepts and normalizes a well-formed invite code', () => {
    const result = validateSignupInput({
      email: 'toi@exemple.fr',
      pin: '123456',
      pinConfirm: '123456',
      inviteCode: '  abcd1234  ',
    });
    expect(result).toEqual({
      ok: true,
      data: { email: 'toi@exemple.fr', pin: '123456', inviteCode: 'ABCD1234' },
    });
  });

  it('rejects an invite code of the wrong length', () => {
    const result = validateSignupInput({
      email: 'toi@exemple.fr',
      pin: '123456',
      pinConfirm: '123456',
      inviteCode: 'ABC',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.inviteCode).toBeDefined();
    }
  });
});
