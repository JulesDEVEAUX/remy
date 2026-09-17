'use client';

import { useActionState } from 'react';
import { Button, TextField } from '@/components/ui';
import { updateHouseholdNameAction } from './actions';

export function HouseholdNameForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState(updateHouseholdNameAction, undefined);

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div className="flex-1">
        <TextField
          label="Nom du foyer"
          name="householdName"
          required
          maxLength={60}
          defaultValue={state?.value ?? defaultName}
          error={state?.error}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? 'Enregistrement' : 'Enregistrer'}
      </Button>
    </form>
  );
}
