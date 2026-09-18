import { Button, EmptyState, IconButton, Icon, PageHeader } from '@/components/ui';
import { getCurrentHousehold, getCurrentUserId } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { getTheme } from '@/lib/theme';
import { AddPersonForm } from './AddPersonForm';
import { deletePersonAction, generateInviteCodeAction } from './actions';
import { HouseholdNameForm } from './HouseholdNameForm';
import { PersonIsMeToggle } from './PersonIsMeToggle';
import { ThemeToggle } from './ThemeToggle';

export default async function ParametresPage() {
  const household = await getCurrentHousehold();
  const [people, theme, userId] = await Promise.all([
    prisma.person.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: 'asc' },
    }),
    getTheme(),
    getCurrentUserId(),
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
              <PersonIsMeToggle personId={person.id} checked={person.linkedUserId === userId} />
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
          Inviter quelqu&apos;un
        </h2>
        <p className="mb-3 font-sans text-[13px] text-clay-700 dark:text-clay-400">
          Partage ce code : à l&apos;inscription, il donne accès à ce foyer plutôt que d&apos;en créer un nouveau.
        </p>
        {household.inviteCode && (
          <p className="mb-3 rounded-md bg-sand px-4 py-3 text-center font-mono text-[20px] font-bold tracking-[0.2em] text-ink dark:bg-clay-800 dark:text-cream">
            {household.inviteCode}
          </p>
        )}
        <form action={generateInviteCodeAction}>
          <Button type="submit" variant="secondary" block>
            {household.inviteCode ? 'Régénérer le code' : "Générer un code d'invitation"}
          </Button>
        </form>
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
