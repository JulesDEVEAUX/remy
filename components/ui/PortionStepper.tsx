'use client';

import { Icon } from './Icon';

/**
 * Scaler de portions du mode cuisine. Pas de champ texte : deux cibles 44px.
 * Les quantités affichées sont recalculées côté appelant (base × couverts).
 */
export function PortionStepper({
  value,
  onChange,
  min = 1,
  max = 8,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const set = (d: number) => onChange(Math.min(max, Math.max(min, value + d)));
  return (
    <div className="flex items-center justify-between rounded-full bg-cream/10 p-2">
      <button
        type="button"
        aria-label="Moins de couverts"
        onClick={() => set(-1)}
        className="flex size-11 items-center justify-center rounded-full bg-cream/15 text-cream transition-colors hover:bg-cream/25"
      >
        <Icon name="Minus" />
      </button>
      <div className="text-center">
        <div className="font-display text-[24px] leading-none text-cream">
          {value} couvert{value > 1 ? 's' : ''}
        </div>
        <div className="font-sans text-[11px] text-cream/60">quantités recalculées</div>
      </div>
      <button
        type="button"
        aria-label="Plus de couverts"
        onClick={() => set(1)}
        className="flex size-11 items-center justify-center rounded-full bg-terracotta text-terracotta-100 transition-colors hover:bg-terracotta-600"
      >
        <Icon name="Plus" />
      </button>
    </div>
  );
}
