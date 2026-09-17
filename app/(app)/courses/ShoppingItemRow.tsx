'use client';

import { useTransition } from 'react';
import { CheckRow } from '@/components/ui';
import { toggleShoppingItemAction } from './actions';

/** Ligne cochable brancheé sur `toggleShoppingItemAction` : cocher persiste, ne supprime jamais l'item. */
export function ShoppingItemRow({
  id,
  label,
  qty,
  checked,
}: {
  id: string;
  label: string;
  qty: string;
  checked: boolean;
}) {
  const [, startTransition] = useTransition();

  return (
    <CheckRow
      label={label}
      qty={qty}
      checked={checked}
      onToggle={() => startTransition(async () => toggleShoppingItemAction(id))}
    />
  );
}
