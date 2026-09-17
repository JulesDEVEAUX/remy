import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * Ligne de navigation générique (fiche ingrédient, recette, etc.) : toute la
 * ligne est cliquable, chevron en affordance — pas de survol comme seul indice.
 */
export function ListRow({
  href,
  icon,
  label,
  meta,
  tag,
}: {
  href: string;
  icon?: IconName;
  label: string;
  meta?: string;
  tag?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[46px] w-full items-center gap-3 rounded-md bg-sand px-4 text-left transition-colors hover:bg-clay-300 dark:bg-clay-800 dark:hover:bg-clay-700"
    >
      {icon && (
        <span className="flex size-6 flex-none items-center justify-center text-terracotta-700 dark:text-terracotta-300">
          <Icon name={icon} size={18} />
        </span>
      )}
      <span className="font-sans text-[15px] font-semibold text-ink dark:text-cream">{label}</span>
      <span className="ml-auto flex items-center gap-2">
        {tag}
        {meta && <span className="font-mono text-[12px] text-clay-700 dark:text-clay-400">{meta}</span>}
        <Icon name="ChevronRight" size={16} className="text-clay-600 dark:text-clay-400" />
      </span>
    </Link>
  );
}
