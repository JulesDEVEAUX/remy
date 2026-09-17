'use client';

import { useActionState } from 'react';
import { Button, TextField } from '@/components/ui';
import { createPersonAction } from './actions';

export function AddPersonForm() {
  const [state, formAction, pending] = useActionState(createPersonAction, undefined);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label="Ajouter un mangeur"
          name="personName"
          required
          maxLength={40}
          defaultValue={state?.value ?? ''}
          error={state?.error}
          placeholder="Prénom"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Ajout' : 'Ajouter'}
      </Button>
    </form>
  );
}
