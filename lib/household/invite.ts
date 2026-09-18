import { randomInt } from 'node:crypto';

// Alphabet sans caractères ambigus à l'oral/à l'écrit (0/O, 1/I) : le code est
// pensé pour être partagé de vive voix ou recopié à la main, pas envoyé par
// email (cf. limites du mailer Supabase, voir docs/CONTEXT.md).
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

/** Génère un code d'invitation de foyer lisible, tiré aléatoirement. */
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

/** Normalise un code saisi par l'utilisateur avant recherche en base. */
export function normalizeInviteCode(raw: string): string {
  return raw.trim().toUpperCase();
}