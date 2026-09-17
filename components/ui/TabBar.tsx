'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Icon, ICONS, type IconName } from './Icon';

const TABS: { href: string; label: string; icon: IconName }[] = [
  { href: '/', label: 'Accueil', icon: ICONS.accueil },
  { href: '/recettes', label: 'Recettes', icon: ICONS.cuisine },
  { href: '/stock', label: 'Stock', icon: ICONS.stock },
  { href: '/courses', label: 'Courses', icon: ICONS.courses },
  { href: '/planning', label: 'Semaine', icon: ICONS.semaine },
];

/** Onglet actif = pastille terracotta-300 sous l'icône. Jamais de soulignement. */
export function TabBar() {
  const path = usePathname();
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex items-center justify-between border-t border-ink/10 bg-sand px-6 pb-5 pt-3 dark:border-cream/10 dark:bg-clay-800">
      {TABS.map((t) => {
        const active = t.href === '/' ? path === '/' : path.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? 'page' : undefined}
            className={clsx(
              'flex min-w-[56px] flex-col items-center gap-1 font-sans text-[10px]',
              active
                ? 'font-bold text-terracotta-700 dark:text-terracotta-300'
                : 'font-medium text-clay-700 dark:text-clay-400',
            )}
          >
            <span
              className={clsx(
                'flex h-[34px] items-center justify-center rounded-full transition-colors',
                active ? 'w-[52px] bg-terracotta-300' : 'w-[34px]',
              )}
            >
              <Icon name={t.icon} size={21} />
            </span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
