'use client';

import clsx from 'clsx';
import type { InputHTMLAttributes } from 'react';
import { ERROR, FIELD, LABEL } from './FormField';

/** Champ mot de passe numérique à 6 chiffres : pastille mono, clavier numérique mobile. */
export function PinField({
  label,
  error,
  className,
  ...rest
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <input
        {...rest}
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        className={clsx(FIELD, 'font-mono tracking-[0.5em]', error && 'ring-2 ring-terracotta-600', className)}
      />
      {error && <span className={ERROR}>{error}</span>}
    </label>
  );
}
