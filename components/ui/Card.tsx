import clsx from 'clsx';
import type { ReactNode } from 'react';

/** Surface sable, rayon lg, aucune bordure : l'élévation vient de l'ombre. */
export function Card({
  children,
  className,
  elevated,
}: {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-lg bg-sand',
        elevated && 'shadow-md',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={clsx('font-display text-[20px] leading-[1.1] text-ink', className)}>
      {children}
    </h3>
  );
}

export function CardMeta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('flex gap-4 font-sans text-[12px] font-medium text-clay-700', className)}>
      {children}
    </div>
  );
}

/** Emplacement photo : à remplacer par <Image>. Rayures = photo manquante, assumée. */
export function PhotoSlot({ label = 'PHOTO DU PLAT', className }: { label?: string; className?: string }) {
  return (
    <div
      className={clsx('flex items-center justify-center', className)}
      style={{
        background: 'repeating-linear-gradient(135deg,#dcd3c4 0 9px,#d3c8b4 9px 18px)',
      }}
    >
      <span className="font-mono text-[10px] tracking-wider text-clay-700">{label}</span>
    </div>
  );
}
