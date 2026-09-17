import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { completeOnboardingAction } from './actions';
import { OnboardingForm } from './OnboardingForm';

export default async function OnboardingPage() {
  const household = await getCurrentHousehold();
  const personCount = await prisma.person.count({ where: { householdId: household.id } });

  if (personCount > 0) {
    redirect('/');
  }

  return (
    <main className="flex min-h-screen flex-col gap-8 bg-cream p-8 dark:bg-ink">
      <Wordmark size={32} />
      <div>
        <h1 className="font-display text-[30px] leading-tight text-ink dark:text-cream">Configure ton foyer</h1>
        <p className="mt-2 font-sans text-[14px] text-clay-700 dark:text-clay-400">
          Donne un nom à ton foyer et ajoute les personnes qui mangent avec toi.
        </p>
      </div>
      <OnboardingForm action={completeOnboardingAction} defaultHouseholdName={household.name} />
    </main>
  );
}
