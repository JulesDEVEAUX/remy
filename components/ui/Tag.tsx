import clsx from 'clsx';
import type { ReactNode } from 'react';

type Tone = 'stock' | 'saison' | 'alerte' | 'neutre';

/**
 * Sémantique des couleurs — à respecter, c'est la lisibilité du produit :
 *  stock/saison → sauge · alerte de péremption → terracotta · info froide → argile
 */
const TONES: Record<Tone, string> = {
  stock: 'bg-sage-200 text-sage-800',
  saison: 'bg-sage-200 text-sage-800',
  alerte: 'bg-terracotta-200 text-terracotta-700',
  neutre: 'bg-clay-200 text-clay-800',
};

export function Tag({
  tone = 'neutre',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-[5px] font-sans text-[11px] font-bold',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
