import clsx from 'clsx';
import { setThemeAction } from './actions';
import type { Theme } from '@/lib/theme';

const OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
];

export function ThemeToggle({ theme }: { theme: Theme }) {
  return (
    <div className="flex gap-2 rounded-full bg-sand p-1 dark:bg-clay-800">
      {OPTIONS.map((option) => {
        const active = option.value === theme;
        return (
          <form key={option.value} action={setThemeAction.bind(null, option.value)} className="flex-1">
            <button
              type="submit"
              aria-pressed={active}
              className={clsx(
                'min-h-[44px] w-full rounded-full font-sans text-[14px] font-bold transition-colors',
                active
                  ? 'bg-terracotta text-terracotta-100'
                  : 'text-clay-700 hover:bg-clay-300 dark:text-clay-400 dark:hover:bg-clay-700',
              )}
            >
              {option.label}
            </button>
          </form>
        );
      })}
    </div>
  );
}
