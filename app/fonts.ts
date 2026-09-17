import { Caprasimo, Figtree, JetBrains_Mono } from 'next/font/google';

/**
 * Trois voix, pas plus :
 *  - Caprasimo : titres courts (≤ 4 mots), noms de recettes, wordmark
 *  - Figtree   : tout le corps, les listes, les boutons
 *  - JetBrains Mono : quantités, unités, dates, libellés techniques
 */
export const caprasimo = Caprasimo({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caprasimo',
});

export const figtree = Figtree({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-figtree',
});

export const jetbrains = JetBrains_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains',
});

export const fontVars = [caprasimo.variable, figtree.variable, jetbrains.variable].join(' ');
