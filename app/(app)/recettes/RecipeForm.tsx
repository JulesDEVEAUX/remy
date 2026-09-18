'use client';

import { useActionState, useState } from 'react';
import { Button, Icon, IconButton, SelectField, Tag, TextField, TextareaField } from '@/components/ui';
import type { RecipeFormValues } from '@/lib/recipes/validation';
import type { RecipeActionState } from './actions';

const SEASON_OPTIONS = [
  { value: 'PRINTEMPS', label: 'Printemps' },
  { value: 'ETE', label: 'Été' },
  { value: 'AUTOMNE', label: 'Automne' },
  { value: 'HIVER', label: 'Hiver' },
  { value: 'TOUTE_ANNEE', label: "Toute l'année" },
];

type IngredientOption = { id: string; name: string; defaultUnit: string };

type Row = { key: string; ingredientId: string; quantity: string; unit: string };

let rowKeySeq = 0;
function makeRow(defaults?: Partial<Omit<Row, 'key'>>): Row {
  rowKeySeq += 1;
  return {
    key: `row-${rowKeySeq}`,
    ingredientId: defaults?.ingredientId ?? '',
    quantity: defaults?.quantity ?? '',
    unit: defaults?.unit ?? '',
  };
}

export function RecipeForm({
  action,
  defaultValues,
  submitLabel,
  ingredientOptions,
  redirectTo,
}: {
  action: (state: RecipeActionState, formData: FormData) => Promise<RecipeActionState>;
  defaultValues?: RecipeFormValues;
  submitLabel: string;
  ingredientOptions: IngredientOption[];
  /** Page vers laquelle revenir après l'ajout — sinon la liste des recettes. */
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? defaultValues;
  const errors = state?.errors;

  const [rows, setRows] = useState<Row[]>(() => {
    const initialRows = values?.ingredientRows.map((row) => makeRow(row)) ?? [];
    return initialRows.length > 0 ? initialRows : [makeRow()];
  });

  function addRow() {
    setRows((current) => [...current, makeRow()]);
  }

  function removeRow(key: string) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  function updateRow(key: string, patch: Partial<Omit<Row, 'key'>>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  /** Suggère l'unité par défaut du produit choisi pour cette ligne. */
  function handleRowIngredientChange(key: string, ingredientId: string) {
    const option = ingredientOptions.find((candidate) => candidate.id === ingredientId);
    updateRow(key, { ingredientId, unit: option?.defaultUnit ?? '' });
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <TextField
        label="Nom"
        name="name"
        required
        maxLength={120}
        defaultValue={values?.name}
        error={errors?.name}
        placeholder="Curry de lentilles"
      />
      <TextField
        label="Lien source"
        name="sourceUrl"
        type="url"
        maxLength={500}
        defaultValue={values?.sourceUrl}
        error={errors?.sourceUrl}
        placeholder="https://…"
      />
      <TextField
        label="Temps de préparation (min)"
        name="prepMinutes"
        type="number"
        min={1}
        defaultValue={values?.prepMinutes}
        error={errors?.prepMinutes}
        placeholder="25"
      />
      <TextareaField
        label="Instructions"
        name="instructions"
        required
        rows={6}
        defaultValue={values?.instructions}
        error={errors?.instructions}
        placeholder="Étapes de préparation…"
      />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">Saisons</span>
        <div className="flex flex-wrap gap-2">
          {SEASON_OPTIONS.map((option) => (
            <label key={option.value} className="cursor-pointer">
              <input
                type="checkbox"
                name="seasons"
                value={option.value}
                defaultChecked={values?.seasons.includes(option.value)}
                className="peer sr-only"
              />
              <Tag tone="neutre" className="peer-checked:bg-sage-200 peer-checked:text-sage-800">
                {option.label}
              </Tag>
            </label>
          ))}
        </div>
        {errors?.seasons && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.seasons}</span>
        )}
      </div>

      <TextField
        label="Tags (séparés par une virgule)"
        name="tags"
        maxLength={200}
        defaultValue={values?.tags}
        error={errors?.tags}
        placeholder="rapide, végétarien"
      />

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
          Ingrédients
        </span>
        {errors?.ingredients && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.ingredients}</span>
        )}

        {ingredientOptions.length === 0 ? (
          <p className="font-sans text-[13px] text-clay-700 dark:text-clay-400">
            Aucun ingrédient au catalogue. Ajoute-en un d&apos;abord.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {rows.map((row) => (
              <div key={row.key} className="flex items-end gap-2">
                <div className="flex-1">
                  <SelectField
                    label="Ingrédient"
                    name="ingredientId[]"
                    required
                    value={row.ingredientId}
                    onChange={(event) => handleRowIngredientChange(row.key, event.target.value)}
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
                </div>
                <div className="w-20">
                  <TextField
                    label="Qté"
                    name="quantity[]"
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={row.quantity}
                    onChange={(event) => updateRow(row.key, { quantity: event.target.value })}
                  />
                </div>
                <div className="w-20">
                  <TextField
                    label="Unité"
                    name="unit[]"
                    required
                    value={row.unit}
                    onChange={(event) => updateRow(row.key, { unit: event.target.value })}
                  />
                </div>
                <IconButton
                  type="button"
                  aria-label="Retirer cet ingrédient"
                  onClick={() => removeRow(row.key)}
                >
                  <Icon name="Minus" size={18} />
                </IconButton>
              </div>
            ))}
          </div>
        )}

        {ingredientOptions.length > 0 && (
          <Button type="button" variant="secondary" icon={<Icon name="Plus" size={18} />} onClick={addRow}>
            Ajouter un ingrédient
          </Button>
        )}
      </div>

      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : submitLabel}
      </Button>
    </form>
  );
}
