'use client';

import { useActionState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import type { IngredientFormValues } from '@/lib/ingredients/validation';
import type { IngredientActionState } from './actions';

const CATEGORY_OPTIONS = [
  { value: 'FRAIS', label: 'Frais' },
  { value: 'EPICERIE', label: 'Épicerie' },
  { value: 'MENAGER', label: 'Ménager' },
  { value: 'BEAUTE', label: 'Beauté' },
  { value: 'AUTRE', label: 'Autre' },
];

const CONSERVATION_OPTIONS = [
  { value: 'COURTE', label: 'Courte' },
  { value: 'MOYENNE', label: 'Moyenne' },
  { value: 'LONGUE', label: 'Longue' },
];

const SOURCE_OPTIONS = [
  { value: 'CARREFOUR', label: 'Carrefour' },
  { value: 'MARCHE', label: 'Marché' },
  { value: 'AUTRE', label: 'Autre' },
];

export function IngredientForm({
  action,
  defaultValues,
  submitLabel,
  redirectTo,
}: {
  action: (state: IngredientActionState, formData: FormData) => Promise<IngredientActionState>;
  defaultValues?: IngredientFormValues;
  submitLabel: string;
  /** Page vers laquelle revenir après l'ajout — sinon la liste des ingrédients. */
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? defaultValues;
  const errors = state?.errors;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <TextField
        label="Nom"
        name="name"
        required
        maxLength={80}
        defaultValue={values?.name}
        error={errors?.name}
        placeholder="Farine T55"
      />
      <SelectField
        label="Catégorie"
        name="category"
        required
        defaultValue={values?.category ?? ''}
        error={errors?.category}
      >
        <option value="" disabled>
          Choisir…
        </option>
        {CATEGORY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <TextField
        label="Unité par défaut"
        name="defaultUnit"
        required
        maxLength={20}
        defaultValue={values?.defaultUnit}
        error={errors?.defaultUnit}
        placeholder="g, L, pièce…"
      />
      <SelectField
        label="Durée de conservation"
        name="conservation"
        required
        defaultValue={values?.conservation ?? ''}
        error={errors?.conservation}
      >
        <option value="" disabled>
          Choisir…
        </option>
        {CONSERVATION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <SelectField
        label="Source d'achat"
        name="defaultSource"
        required
        defaultValue={values?.defaultSource ?? ''}
        error={errors?.defaultSource}
      >
        <option value="" disabled>
          Choisir…
        </option>
        {SOURCE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : submitLabel}
      </Button>
    </form>
  );
}
