'use client';

import { useTransition } from 'react';
import { CheckRow, Icon, IconButton } from '@/components/ui';
import { deleteShoppingItemAction, toggleShoppingItemAction } from './actions';

/**
 * Ligne cochable brancheé sur `toggleShoppingItemAction`, avec un bouton de
 * suppression à part (cf. issue #68) : pas de geste de swipe, le système de
 * design l'exclut explicitement (`docs/identite-visuelle.md`, section 8).
 */
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
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <CheckRow
          label={label}
          qty={qty}
          checked={checked}
          onToggle={() => startTransition(async () => toggleShoppingItemAction(id))}
        />
      </div>
      <IconButton
        aria-label={`Supprimer ${label}`}
        onClick={() => startTransition(async () => deleteShoppingItemAction(id))}
      >
        <Icon name="Trash" size={18} />
      </IconButton>
    </div>
  );
}
