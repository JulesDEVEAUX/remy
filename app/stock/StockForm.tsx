'use client';

import { useActionState } from 'react';
import { Button, SelectField, TextField } from '@/components/ui';
import type { StockFormValues } from '@/lib/stock/validation';
import type { StockActionState } from './actions';

type IngredientOption = { id: string; name: string };

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

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {fixedIngredientName ? (
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700">
            Ingrédient
          </span>
          <p className="font-sans text-[15px] font-semibold text-ink">{fixedIngredientName}</p>
          <input type="hidden" name="ingredientId" value={values?.ingredientId} />
        </div>
      ) : (
        <SelectField
          label="Ingrédient"
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
        defaultValue={values?.unit}
        error={errors?.unit}
        placeholder="g, L, pièce…"
      />
      <TextField
        label="Date de péremption"
        name="expiresAt"
        type="date"
        defaultValue={values?.expiresAt}
        error={errors?.expiresAt}
      />
      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : submitLabel}
      </Button>
    </form>
  );
}
