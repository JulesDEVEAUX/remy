import { describe, expect, it } from 'vitest';
import { EMOJI_OPTIONS, isSingleEmoji, pickRandomEmoji } from '@/lib/emoji';

describe('pickRandomEmoji', () => {
  it('always returns one of the curated options', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(EMOJI_OPTIONS).toContain(pickRandomEmoji());
    }
  });
});

describe('isSingleEmoji', () => {
  it('accepts a simple emoji', () => {
    expect(isSingleEmoji('🥕')).toBe(true);
  });

  it('accepts an emoji with a skin tone modifier', () => {
    expect(isSingleEmoji('👍🏽')).toBe(true);
  });

  it('accepts a ZWJ sequence forming a single glyph', () => {
    expect(isSingleEmoji('👨‍👩‍👧‍👦')).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    expect(isSingleEmoji('  🥕  ')).toBe(true);
  });

  it('rejects plain text', () => {
    expect(isSingleEmoji('A')).toBe(false);
    expect(isSingleEmoji('farine')).toBe(false);
  });

  it('rejects an empty value', () => {
    expect(isSingleEmoji('')).toBe(false);
    expect(isSingleEmoji('   ')).toBe(false);
  });

  it('rejects more than one emoji', () => {
    expect(isSingleEmoji('🥕🍎')).toBe(false);
  });
});