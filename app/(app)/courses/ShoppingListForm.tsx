'use client';

import { useActionState } from 'react';
import { Button, TextField } from '@/components/ui';
import { createShoppingListAction } from './actions';

export function ShoppingListForm() {
  const [state, formAction, pending] = useActionState(createShoppingListAction, undefined);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label="Nouvelle liste"
          name="listName"
          required
          maxLength={40}
          defaultValue={state?.value ?? ''}
          error={state?.error}
          placeholder="Weekend chez mes parents"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Création' : 'Créer'}
      </Button>
    </form>
  );
}
