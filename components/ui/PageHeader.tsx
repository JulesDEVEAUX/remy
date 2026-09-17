import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * En-tête d'écran standard : titre Caprasimo, retour optionnel vers une liste,
 * action optionnelle à droite (un seul bouton primaire par écran, cf. doctrine).
 */
export function PageHeader({
  title,
  backHref,
  action,
}: {
  title: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-center gap-3">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Retour"
          className="flex size-11 flex-none items-center justify-center rounded-full bg-sand text-terracotta-700 transition-colors hover:bg-clay-300"
        >
          <Icon name="ChevronLeft" size={20} />
        </Link>
      )}
      <h1 className="flex-1 truncate font-display text-[30px] leading-tight text-ink">{title}</h1>
      {action}
    </header>
  );
}
