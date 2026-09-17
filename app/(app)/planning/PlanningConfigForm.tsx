'use client';

import { useActionState } from 'react';
import { Button, Tag, TextField } from '@/components/ui';
import { MAX_MEALS_PER_DAY, MIN_MEALS_PER_DAY } from '@/lib/planning/slots';
import type { WeekConfigFormValues } from '@/lib/planning/validation';
import type { WeekConfigActionState } from './actions';

const MEALS_PER_DAY_OPTIONS = Array.from(
  { length: MAX_MEALS_PER_DAY - MIN_MEALS_PER_DAY + 1 },
  (_, index) => MIN_MEALS_PER_DAY + index,
);

export function PlanningConfigForm({
  action,
  defaultValues,
  submitLabel = 'Générer la semaine',
}: {
  action: (state: WeekConfigActionState, formData: FormData) => Promise<WeekConfigActionState>;
  defaultValues: WeekConfigFormValues;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? defaultValues;
  const errors = state?.errors;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <TextField
        label="Date de début"
        name="startDate"
        type="date"
        required
        defaultValue={values.startDate}
        error={errors?.startDate}
      />

      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700">
          Repas par jour
        </span>
        <div className="flex flex-wrap gap-2">
          {MEALS_PER_DAY_OPTIONS.map((count) => (
            <label key={count} className="cursor-pointer">
              <input
                type="radio"
                name="mealsPerDay"
                value={count}
                required
                defaultChecked={values.mealsPerDay === String(count)}
                className="peer sr-only"
              />
              <Tag tone="neutre" className="peer-checked:bg-sage-200 peer-checked:text-sage-800">
                {count}
              </Tag>
            </label>
          ))}
        </div>
        {errors?.mealsPerDay && (
          <span className="px-2 font-sans text-[12px] font-medium text-terracotta-700">{errors.mealsPerDay}</span>
        )}
      </div>

      <Button type="submit" block disabled={pending}>
        {pending ? 'Génération…' : submitLabel}
      </Button>
    </form>
  );
}
