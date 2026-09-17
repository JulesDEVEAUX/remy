'use client';

import clsx from 'clsx';
import { Icon } from './Icon';

/**
 * La ligne cochable — brique centrale de Remy (courses, mode cuisine).
 * Toute la ligne est la cible tactile (≥ 46px), pas seulement la case.
 * Coché = case sauge pleine + libellé barré en argile.
 */
export function CheckRow({
  label,
  qty,
  checked,
  onToggle,
  tone = 'light',
}: {
  label: string;
  qty?: string;
  checked: boolean;
  onToggle: () => void;
  /** 'light' = écrans crème · 'ink' = mode cuisine sombre */
  tone?: 'light' | 'ink';
}) {
  const ink = tone === 'ink';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={clsx(
        'flex min-h-[46px] w-full items-center gap-3 rounded-md px-4 text-left transition-colors',
        ink
          ? checked
            ? 'bg-cream/[0.07]'
            : 'hover:bg-cream/10'
          : checked
            ? 'bg-clay-100'
            : 'bg-sand hover:bg-clay-300',
      )}
    >
      <span
        className={clsx(
          'flex size-6 flex-none items-center justify-center border-[1.5px]',
          ink ? 'rounded-full' : 'rounded-sm',
          checked
            ? ink
              ? 'border-terracotta-400 bg-terracotta-400 text-ink'
              : 'border-sage bg-sage text-terracotta-100'
            : ink
              ? 'border-cream/40 text-transparent'
              : 'border-ink/35 text-transparent',
        )}
      >
        <Icon name="Check" size={15} />
      </span>
      <span
        className={clsx(
          'font-sans text-[15px] font-semibold',
          checked && 'line-through',
          ink
            ? checked
              ? 'text-cream/45'
              : 'text-cream'
            : checked
              ? 'text-ink/45'
              : 'text-ink',
        )}
      >
        {label}
      </span>
      {qty && (
        <span
          className={clsx(
            'ml-auto font-mono text-[13px] font-medium',
            ink ? 'text-terracotta-400' : 'text-clay-700',
          )}
        >
          {qty}
        </span>
      )}
    </button>
  );
}
