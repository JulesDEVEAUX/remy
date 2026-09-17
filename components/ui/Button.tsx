'use client';

import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onInk';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-terracotta text-terracotta-100 hover:bg-terracotta-600 active:bg-terracotta-700',
  secondary:
    'border-[1.5px] border-terracotta text-terracotta-700 hover:bg-terracotta-200 active:bg-terracotta-300',
  ghost: 'text-terracotta-700 hover:bg-terracotta-200 active:bg-terracotta-300',
  onInk: 'bg-cream text-ink hover:bg-terracotta-200 active:bg-terracotta-300',
};

/** Tout est en pastille (rounded-full) et ≥ 44px de haut : c'est une app au doigt. */
export function Button({
  variant = 'primary',
  block,
  icon,
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  block?: boolean;
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 font-sans text-[15px] font-bold transition-colors',
        block && 'w-full',
        VARIANTS[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/** Bouton icône rond — 44px minimum, fond sable. */
export function IconButton({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={clsx(
        'inline-flex size-11 items-center justify-center rounded-full bg-sand text-terracotta-700 transition-colors hover:bg-clay-300 active:bg-clay-400',
        className,
      )}
    >
      {children}
    </button>
  );
}
