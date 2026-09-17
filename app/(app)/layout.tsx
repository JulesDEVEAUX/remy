import type { ReactNode } from 'react';
import { TabBar } from '@/components/ui';

/** Coquille des écrans avec barre d'onglets basse. Auth/onboarding restent hors de ce groupe. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      {children}
      <TabBar />
    </div>
  );
}
