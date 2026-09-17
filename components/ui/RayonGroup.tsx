import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/**
 * En-tête de rayon dans la liste de courses : icône ronde, libellé en capitales,
 * filet qui pousse la source d'achat à droite (Carrefour / hors-Carrefour).
 */
export function RayonGroup({
  rayon,
  icon,
  source,
  children,
}: {
  rayon: string;
  icon: IconName;
  source: string;
  children: ReactNode;
}) {
  return (
    <section>
      <header className="mb-2 flex items-center gap-2">
        <span className="flex size-7 flex-none items-center justify-center rounded-full bg-sand text-terracotta-700">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="font-sans text-[12px] font-bold uppercase tracking-[0.06em] text-clay-800">
          {rayon}
        </h2>
        <span className="h-px flex-1 bg-ink/15" />
        <span className="font-mono text-[11px] text-clay-600">{source}</span>
      </header>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}
