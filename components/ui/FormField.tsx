import clsx from 'clsx';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

const LABEL = 'font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700';
const FIELD =
  'min-h-[48px] rounded-full bg-sand px-5 font-sans text-[15px] text-ink outline-none placeholder:text-clay-500 focus:ring-2 focus:ring-terracotta';
const ERROR = 'px-2 font-sans text-[12px] font-medium text-terracotta-700';

/** Champ texte pastille : libellé technique mono, saisie en Figtree. */
export function TextField({
  label,
  error,
  className,
  ...rest
}: { label: string; error?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <input {...rest} className={clsx(FIELD, error && 'ring-2 ring-terracotta-600', className)} />
      {error && <span className={ERROR}>{error}</span>}
    </label>
  );
}

/** Sélecteur pastille assorti à TextField, chevron via Icon (jamais de lucide-react direct). */
export function SelectField({
  label,
  error,
  className,
  children,
  ...rest
}: { label: string; error?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      <span className="relative block">
        <select
          {...rest}
          className={clsx(FIELD, 'w-full appearance-none pr-11', error && 'ring-2 ring-terracotta-600', className)}
        >
          {children}
        </select>
        <Icon
          name="ChevronDown"
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-terracotta-700"
        />
      </span>
      {error && <span className={ERROR}>{error}</span>}
    </label>
  );
}
