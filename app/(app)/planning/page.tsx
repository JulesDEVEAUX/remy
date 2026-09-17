import Link from 'next/link';
import { Button, ICONS, Icon, IconButton, ListRow, PageHeader, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { addDays, formatDateParam, getCurrentWeekStart, getWeekDates, parseDateParam } from '@/lib/planning/dates';
import { buildWeekSummary, groupSlotsByDay } from '@/lib/planning/mapping';
import { detectMealsPerDay } from '@/lib/planning/slots';
import { prisma } from '@/lib/prisma';
import { configureWeekAction } from './actions';
import { DaysView } from './DaysView';
import { PlanningConfigForm } from './PlanningConfigForm';

type ViewMode = 'jours' | 'resume';

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; view?: string; reconfigurer?: string }>;
}) {
  const { start, view, reconfigurer } = await searchParams;
  const household = await getCurrentHousehold();

  const weekStart = parseDateParam(start) ?? getCurrentWeekStart();
  const weekStartParam = formatDateParam(weekStart);
  const weekDates = getWeekDates(weekStart);

  const mealPlans = await prisma.mealPlan.findMany({
    where: { householdId: household.id, date: { gte: weekDates[0], lt: addDays(weekDates[6], 1) } },
    include: { recipe: true },
    orderBy: { date: 'asc' },
  });

  if (mealPlans.length === 0 || reconfigurer === '1') {
    const detectedMealsPerDay = detectMealsPerDay(mealPlans.map((mealPlan) => mealPlan.mealType));
    return (
      <main className="p-6 pb-32">
        <PageHeader
          title="Planning"
          backHref={mealPlans.length > 0 ? `/planning?start=${weekStartParam}` : undefined}
        />
        <p className="mb-6 font-sans text-[14px] text-clay-700">
          Choisis la semaine à planifier et le nombre de repas par jour.
        </p>
        <PlanningConfigForm
          action={configureWeekAction}
          defaultValues={{ startDate: weekStartParam, mealsPerDay: String(detectedMealsPerDay ?? 2) }}
          submitLabel={mealPlans.length > 0 ? 'Mettre à jour la semaine' : 'Générer la semaine'}
        />
      </main>
    );
  }

  const viewMode: ViewMode = view === 'resume' ? 'resume' : 'jours';
  const days = groupSlotsByDay(weekDates, mealPlans);
  const summaryRows = buildWeekSummary(weekDates, mealPlans);
  const prevWeekParam = formatDateParam(addDays(weekStart, -7));
  const nextWeekParam = formatDateParam(addDays(weekStart, 7));

  return (
    <main className="p-6 pb-32">
      <PageHeader
        title="Planning"
        action={
          <Link href={`/planning?start=${weekStartParam}&reconfigurer=1`}>
            <IconButton aria-label="Reconfigurer la semaine">
              <Icon name={ICONS.reglages} size={18} />
            </IconButton>
          </Link>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <Link href={`/planning?start=${prevWeekParam}&view=${viewMode}`}>
          <IconButton aria-label="Semaine précédente">
            <Icon name="ChevronLeft" size={18} />
          </IconButton>
        </Link>
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-clay-700">
          Semaine du {weekDates[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
        </span>
        <Link href={`/planning?start=${nextWeekParam}&view=${viewMode}`}>
          <IconButton aria-label="Semaine suivante">
            <Icon name="ChevronRight" size={18} />
          </IconButton>
        </Link>
      </div>

      <div className="mb-6 flex gap-2">
        <Link href={`/planning?start=${weekStartParam}&view=jours`} className="flex-1">
          <Button variant={viewMode === 'jours' ? 'primary' : 'secondary'} block>
            Jours
          </Button>
        </Link>
        <Link href={`/planning?start=${weekStartParam}&view=resume`} className="flex-1">
          <Button variant={viewMode === 'resume' ? 'primary' : 'secondary'} block>
            Résumé
          </Button>
        </Link>
      </div>

      {viewMode === 'jours' ? (
        <DaysView days={days} weekStartParam={weekStartParam} />
      ) : (
        <div className="flex flex-col gap-1.5">
          {summaryRows.map((row) => (
            <ListRow
              key={row.id}
              href={`/planning/${row.id}?start=${weekStartParam}`}
              icon={ICONS.cuisine}
              label={row.recipeName ?? 'Aucune recette'}
              meta={`${row.dayLabel} · ${row.mealTypeLabel}`}
              tag={
                <>
                  {row.isBatch && <Tag tone="stock">Batch</Tag>}
                  {row.isEmpty && <Tag tone="alerte">À assigner</Tag>}
                </>
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
