'use client';

import { useActionState, useState } from 'react';
import { Button, Icon, IconButton, TextField } from '@/components/ui';
import type { OnboardingFormValues } from '@/lib/people/validation';
import type { OnboardingActionState } from './actions';

type Row = { key: string; name: string };

let rowKeySeq = 0;
function makeRow(name = ''): Row {
  rowKeySeq += 1;
  return { key: `row-${rowKeySeq}`, name };
}

export function OnboardingForm({
  action,
  defaultHouseholdName,
}: {
  action: (state: OnboardingActionState, formData: FormData) => Promise<OnboardingActionState>;
  defaultHouseholdName: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values: OnboardingFormValues | undefined = state?.values;
  const errors = state?.errors;

  const [rows, setRows] = useState<Row[]>(() => {
    const initialRows = values?.personNames.map((name) => makeRow(name)) ?? [];
    return initialRows.length > 0 ? initialRows : [makeRow()];
  });

  function addRow() {
    setRows((current) => [...current, makeRow()]);
  }

  function removeRow(key: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Nom du foyer"
        name="householdName"
        required
        maxLength={60}
        defaultValue={values?.householdName ?? defaultHouseholdName}
        error={errors?.householdName}
        placeholder="Mon foyer"
      />

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
          Qui mange à la maison ?
        </span>
        {errors?.personNames && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.personNames}</span>
        )}
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <div key={row.key} className="flex items-end gap-2">
              <div className="flex-1">
                <TextField label="Prénom" name="personName[]" required maxLength={40} defaultValue={row.name} />
              </div>
              <IconButton type="button" aria-label="Retirer ce mangeur" onClick={() => removeRow(row.key)}>
                <Icon name="Minus" size={18} />
              </IconButton>
            </div>
          ))}
        </div>
        <Button type="button" variant="secondary" icon={<Icon name="Plus" size={18} />} onClick={addRow}>
          Ajouter un mangeur
        </Button>
      </div>

      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : 'Continuer'}
      </Button>
    </form>
  );
}
