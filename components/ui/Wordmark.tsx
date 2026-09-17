import clsx from 'clsx';

/**
 * « remy » en Caprasimo bas de casse, suivi d'un point terracotta.
 * Le point est le symbole du produit : il veut dire « c'est fait ».
 * Règles : jamais en capitales, jamais étiré, jamais sur une photo non lavée.
 */
export function Wordmark({
  size = 24,
  dot = true,
  className,
  tone = 'ink',
}: {
  size?: number;
  dot?: boolean;
  className?: string;
  tone?: 'ink' | 'cream';
}) {
  const dotSize = Math.max(4, Math.round(size * 0.17));
  return (
    <span className={clsx('inline-flex items-end', className)} aria-label="Remy">
      <span
        className={clsx('font-display leading-none', tone === 'ink' ? 'text-ink' : 'text-cream')}
        style={{ fontSize: size, letterSpacing: '-0.02em' }}
      >
        remy
      </span>
      {dot && (
        <span
          className="block flex-none rounded-full bg-terracotta"
          style={{ width: dotSize, height: dotSize, marginBottom: Math.round(size * 0.07) }}
        />
      )}
    </span>
  );
}
