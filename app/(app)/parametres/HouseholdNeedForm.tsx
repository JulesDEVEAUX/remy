'use client';

import { useActionState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import type { CreateHouseholdNeedState } from './actions';

type IngredientOption = { id: string; name: string };

export function HouseholdNeedForm({
  action,
  ingredientOptions,
}: {
  action: (state: CreateHouseholdNeedState, formData: FormData) => Promise<CreateHouseholdNeedState>;
  ingredientOptions: IngredientOption[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values;
  const errors = state?.errors;

  if (ingredientOptions.length === 0) {
    return (
      <p className="font-sans text-[13px] text-clay-700 dark:text-clay-400">
        Aucun ingrédient au catalogue. Ajoute-en un d&apos;abord pour déclarer un besoin récurrent.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg bg-sand p-4 dark:bg-clay-800">
      <SelectField
        label="Produit"
        name="ingredientId"
        required
        defaultValue={values?.ingredientId ?? ''}
        error={errors?.ingredientId}
      >
        <option value="" disabled>
          Choisir…
        </option>
        {ingredientOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </SelectField>
      <div className="flex gap-2">
        <div className="flex-1">
          <TextField
            label="Quantité / mois"
            name="monthlyQuantity"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={values?.monthlyQuantity}
            error={errors?.monthlyQuantity}
            placeholder="1"
          />
        </div>
        <div className="flex-1">
          <TextField
            label="Unité"
            name="unit"
            required
            maxLength={20}
            defaultValue={values?.unit}
            error={errors?.unit}
            placeholder="L, pièce…"
          />
        </div>
      </div>
      <Button type="submit" variant="secondary" block disabled={pending}>
        {pending ? 'Ajout' : 'Ajouter'}
      </Button>
    </form>
  );
}
