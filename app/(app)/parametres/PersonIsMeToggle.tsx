'use client';

import { useTransition } from 'react';
import { togglePersonIsMeAction } from './actions';

/** Case à cocher « c'est moi » sur un mangeur — cf. issue #25. */
export function PersonIsMeToggle({ personId, checked }: { personId: string; checked: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex cursor-pointer items-center gap-1.5">
      <input
        type="checkbox"
        checked={checked}
        disabled={pending}
        onChange={() => startTransition(async () => togglePersonIsMeAction(personId))}
        className="size-4 accent-terracotta"
      />
      <span className="font-mono text-[11px] text-clay-600 dark:text-clay-400">c&apos;est moi</span>
    </label>
  );
}
