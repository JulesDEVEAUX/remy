'use client';

import type { ConservationDuree } from '@prisma/client';
import { useActionState, useState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import { estimateExpiryDate } from '@/lib/stock/expiry';
import { toDateInputValue } from '@/lib/stock/mapping';
import type { StockFormValues } from '@/lib/stock/validation';
import type { StockActionState } from './actions';

type IngredientOption = { id: string; name: string; defaultUnit: string; conservation: ConservationDuree };

export function StockForm({
  action,
  defaultValues,
  submitLabel,
  ingredientOptions,
  fixedIngredientName,
}: {
  action: (state: StockActionState, formData: FormData) => Promise<StockActionState>;
  defaultValues?: StockFormValues;
  submitLabel: string;
  ingredientOptions: IngredientOption[];
  /** Renseigné en ajustement : l'ingrédient d'une entrée de stock ne se change pas, seule la quantité s'ajuste. */
  fixedIngredientName?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? defaultValues;
  const errors = state?.errors;

  const [unit, setUnit] = useState(values?.unit ?? '');
  const [expiresAt, setExpiresAt] = useState(values?.expiresAt ?? '');

  /** Suggère l'unité par défaut du produit et une date de péremption estimée à partir de sa durée de conservation. */
  function handleIngredientChange(ingredientId: string) {
    const option = ingredientOptions.find((candidate) => candidate.id === ingredientId);
    if (!option) {
      return;
    }
    setUnit(option.defaultUnit);
    setExpiresAt(toDateInputValue(estimateExpiryDate(option.conservation, new Date())));
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fixedIngredientName ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Ingrédient
          </span>
          <p className="font-sans text-[15px] font-semibold text-ink dark:text-cream">{fixedIngredientName}</p>
          <input type="hidden" name="ingredientId" value={values?.ingredientId} />
        </div>
      ) : (
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
      )}
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
      <TextField
        label="Date de péremption"
        name="expiresAt"
        type="date"
        value={expiresAt}
        onChange={(event) => setExpiresAt(event.target.value)}
        error={errors?.expiresAt}
      />
      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : submitLabel}
      </Button>
    </form>
  );
}
