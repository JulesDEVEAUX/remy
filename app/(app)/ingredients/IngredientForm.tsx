'use client';

import { useActionState } from 'react';
import { Button, CheckboxField, SelectField, TextField } from '@/components/ui';
import { UNIT_OPTIONS } from '@/lib/ingredients/units';
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

  // Un ingrédient existant peut porter une unité saisie avant l'introduction de
  // cette liste fermée (cf. issue #28) : on l'ajoute en option supplémentaire
  // plutôt que de la faire disparaître silencieusement du formulaire d'édition.
  const unitOptions =
    values?.defaultUnit && !UNIT_OPTIONS.some((option) => option.value === values.defaultUnit)
      ? [...UNIT_OPTIONS, { value: values.defaultUnit, label: values.defaultUnit }]
      : UNIT_OPTIONS;

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
      <SelectField
        label="Unité par défaut"
        name="defaultUnit"
        required
        defaultValue={values?.defaultUnit ?? ''}
        error={errors?.defaultUnit}
      >
        <option value="" disabled>
          Choisir…
        </option>
        {unitOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
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
      <CheckboxField label="Ingrédient privé" name="isPrivate" defaultChecked={values?.isPrivate} />
      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : submitLabel}
      </Button>
    </form>
  );
}
