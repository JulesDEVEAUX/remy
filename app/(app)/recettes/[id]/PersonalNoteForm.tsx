'use client';

import { useActionState } from 'react';
import { Button, TextareaField } from '@/components/ui';
import type { PersonalNoteActionState } from '../actions';

export function PersonalNoteForm({
  action,
  defaultValue,
}: {
  action: (state: PersonalNoteActionState, formData: FormData) => Promise<PersonalNoteActionState>;
  defaultValue: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <TextareaField
        label="Note perso"
        name="personalNote"
        rows={3}
        maxLength={2000}
        defaultValue={defaultValue}
        error={state?.error}
        placeholder="Ce que tu changerais la prochaine fois…"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? 'Enregistrement' : 'Enregistrer la note'}
      </Button>
    </form>
  );
}
