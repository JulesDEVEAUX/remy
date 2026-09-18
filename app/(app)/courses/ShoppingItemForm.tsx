'use client';

import { useActionState, useState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import type { ShoppingItemActionState } from './actions';

type IngredientOption = { id: string; name: string; defaultUnit: string };

export function ShoppingItemForm({
  action,
  ingredientOptions,
  shoppingListId,
}: {
  action: (state: ShoppingItemActionState, formData: FormData) => Promise<ShoppingItemActionState>;
  ingredientOptions: IngredientOption[];
  shoppingListId: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values;
  const errors = state?.errors;

  const [unit, setUnit] = useState(values?.unit ?? '');

  /** Suggère l'unité par défaut du produit choisi. */
  function handleIngredientChange(ingredientId: string) {
    const option = ingredientOptions.find((candidate) => candidate.id === ingredientId);
    if (option) {
      setUnit(option.defaultUnit);
    }
  }

  if (ingredientOptions.length === 0) {
    return (
      <p className="mb-8 font-sans text-[13px] text-clay-700 dark:text-clay-400">
        Aucun ingrédient au catalogue. Ajoute-en un d&apos;abord pour pouvoir compléter la liste.
      </p>
    );
  }

  return (
    <form action={formAction} className="mb-8 flex flex-col gap-3 rounded-lg bg-sand p-4 dark:bg-clay-800">
      <input type="hidden" name="shoppingListId" value={shoppingListId} />
      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
        Ajouter un article
      </span>
      <SelectField
        label="Ingrédient"
        name="ingredientId"
        required
        defaultValue={values?.ingredientId ?? ''}
        error={errors?.ingredientId}
        onChange={(event) => handleIngredientChange(event.target.value)}
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
            label="Quantité"
            name="quantity"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={values?.quantity}
            error={errors?.quantity}
            placeholder="500"
          />
        </div>
        <div className="flex-1">
          <TextField
            label="Unité"
            name="unit"
            required
            maxLength={20}
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            error={errors?.unit}
            placeholder="g, L, pièce…"
          />
        </div>
      </div>
      <Button type="submit" variant="secondary" block disabled={pending}>
        {pending ? 'Ajout' : 'Ajouter'}
      </Button>
    </form>
  );
}
