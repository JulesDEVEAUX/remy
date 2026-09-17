'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Button, TextareaField } from '@/components/ui';
import type { CommentActionState } from '../actions';

export function CommentForm({
  action,
}: {
  action: (state: CommentActionState, formData: FormData) => Promise<CommentActionState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <TextareaField
        label="Ajouter un commentaire"
        name="body"
        rows={3}
        maxLength={1000}
        error={state?.error}
        placeholder="Ce qui a marché, ce qui a manqué…"
      />
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? 'Envoi' : 'Publier'}
      </Button>
    </form>
  );
}
