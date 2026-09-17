'use client';

import { useActionState, useState } from 'react';
import { Button, Card, CardMeta, CardTitle, Tag } from '@/components/ui';
import type { SuggestionViewModel } from '@/lib/suggestions/mapping';
import type { AssignmentActionState } from '../actions';

type OtherSlot = { id: string; label: string; recipeName: string | null };

export function AssignRecipeForm({
  action,
  recipes,
  otherSlots,
  defaultRecipeId,
  defaultIsBatch,
}: {
  action: (state: AssignmentActionState, formData: FormData) => Promise<AssignmentActionState>;
  recipes: SuggestionViewModel[];
  otherSlots: OtherSlot[];
  defaultRecipeId: string | null;
  defaultIsBatch: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const errors = state?.errors;
  const [isBatch, setIsBatch] = useState(defaultIsBatch);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700">Recette</span>
        {errors?.recipeId && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.recipeId}</span>
        )}
        {errors?.reuse && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.reuse}</span>
        )}

        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => (
            <label key={recipe.id} className="cursor-pointer">
              <input
                type="radio"
                name="recipeId"
                value={recipe.id}
                required
                defaultChecked={defaultRecipeId === recipe.id}
                className="peer sr-only"
              />
              <Card className="flex flex-col gap-2 p-5 peer-checked:ring-2 peer-checked:ring-terracotta" elevated>
                <CardTitle>{recipe.name}</CardTitle>
                <CardMeta>
                  <span className="font-mono">{recipe.coveragePercentLabel} en stock</span>
                  {recipe.prepMinutesLabel && <span className="font-mono">{recipe.prepMinutesLabel}</span>}
                </CardMeta>
                {recipe.badges.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.badges.map((badge) => (
                      <Tag key={badge.label} tone={badge.tone}>
                        {badge.label}
                      </Tag>
                    ))}
                  </div>
                )}
              </Card>
            </label>
          ))}
        </div>
      </div>

      <label className="flex min-h-[48px] w-full cursor-pointer items-center gap-3 rounded-full bg-sand px-5">
        <input
          type="checkbox"
          name="isBatch"
          checked={isBatch}
          onChange={(event) => setIsBatch(event.target.checked)}
          className="size-5 accent-terracotta"
        />
        <span className="font-sans text-[15px] font-semibold text-ink">Batch cooking</span>
      </label>

      {isBatch && otherSlots.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700">
            Réutiliser aussi sur…
          </span>
          {errors?.additionalSlotIds && (
            <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">
              {errors.additionalSlotIds}
            </span>
          )}
          <div className="flex flex-col gap-1.5">
            {otherSlots.map((slot) => (
              <label
                key={slot.id}
                className="flex min-h-[46px] w-full cursor-pointer items-center gap-3 rounded-md bg-sand px-4"
              >
                <input
                  type="checkbox"
                  name="additionalSlotIds[]"
                  value={slot.id}
                  className="size-5 flex-none accent-terracotta"
                />
                <span className="flex-1 font-sans text-[14px] font-semibold text-ink">{slot.label}</span>
                {slot.recipeName && (
                  <span className="font-mono text-[11px] text-clay-600">remplace « {slot.recipeName} »</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" block disabled={pending}>
        {pending ? 'Enregistrement' : 'Assigner'}
      </Button>
    </form>
  );
}
