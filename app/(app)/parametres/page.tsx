import { EmptyState, IconButton, Icon, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { getTheme } from '@/lib/theme';
import { AddPersonForm } from './AddPersonForm';
import { deletePersonAction } from './actions';
import { HouseholdNameForm } from './HouseholdNameForm';
import { ThemeToggle } from './ThemeToggle';

export default async function ParametresPage() {
  const household = await getCurrentHousehold();
  const [people, theme] = await Promise.all([
    prisma.person.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: 'asc' },
    }),
    getTheme(),
  ]);

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Paramètres" backHref="/" />

      <section className="mb-8">
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800 dark:text-clay-300">Foyer</h2>
        <HouseholdNameForm defaultName={household.name} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800 dark:text-clay-300">Membres</h2>
        <div className="mb-3 flex flex-col gap-1.5">
          {people.map((person) => (
            <div key={person.id} className="flex min-h-[46px] items-center gap-3 rounded-md bg-sand px-4 dark:bg-clay-800">
              <span className="font-sans text-[15px] font-semibold text-ink dark:text-cream">{person.name}</span>
              <form action={deletePersonAction.bind(null, person.id)} className="ml-auto">
                <IconButton type="submit" aria-label={`Retirer ${person.name}`}>
                  <Icon name="X" size={18} />
                </IconButton>
              </form>
            </div>
          ))}
        </div>
        <AddPersonForm key={people.length} />
      </section>

      <section className="mb-8">
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800 dark:text-clay-300">
          Apparence
        </h2>
        <ThemeToggle theme={theme} />
      </section>

      <section>
        <h2 className="mb-2 font-sans text-[13px] font-bold uppercase tracking-[0.04em] text-clay-800 dark:text-clay-300">
          Préférences
        </h2>
        <EmptyState icon="Heart" title="Les préférences par personne arrivent bientôt." />
      </section>
    </main>
  );
}
