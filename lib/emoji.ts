/**
 * Emojis pertinents pour illustrer un produit ou une recette — pool utilisé
 * pour proposer un choix aléatoire à la création (cf. issue #73), et pour le
 * bouton « au hasard » du formulaire.
 */
export const EMOJI_OPTIONS = [
  '🥕', '🍎', '🍌', '🍇', '🍋', '🍓', '🍊', '🥦', '🧅', '🧄', '🥔', '🍅', '🥬', '🌽', '🍄',
  '🥩', '🍗', '🥓', '🐟', '🍳', '🥛', '🧀', '🧈', '🍞', '🥐', '🍚', '🍝', '🌾',
  '🧴', '🧻', '🧽', '🧼', '🪥',
  '🍲', '🥗', '🍕', '🍔', '🥘', '🍜', '🍛', '🧁', '🍰', '🍪', '☕', '🍵', '🧃',
  '📦',
] as const;

/** Choisit un emoji au hasard dans le pool ci-dessus. */
export function pickRandomEmoji(): string {
  return EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
}

const PICTOGRAPHIC = /\p{Extended_Pictographic}/u;

/**
 * Un unique emoji, éventuellement composé de plusieurs points de code (ZWJ,
 * variante de peau, drapeau…) mais formant un seul glyphe visuel. Rejette le
 * texte brut (lettres, chiffres) et les suites de plusieurs emojis.
 */
export function isSingleEmoji(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || !PICTOGRAPHIC.test(trimmed)) {
    return false;
  }
  return [...new Intl.Segmenter().segment(trimmed)].length === 1;
}