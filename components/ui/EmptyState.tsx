import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * État vide standard : icône dans une pastille sable, message en ton majordome
 * (factuel, pas d'emoji), action optionnelle. Réutilisé partout où une liste
 * ou une fonctionnalité n'a pas encore de contenu.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg bg-sand px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-clay-200 text-terracotta-700">
        <Icon name={icon} size={24} />
      </span>
      <p className="font-sans text-[15px] font-semibold text-ink">{title}</p>
      {description && <p className="max-w-[36ch] font-sans text-[13px] text-clay-700">{description}</p>}
      {action}
    </div>
  );
}
