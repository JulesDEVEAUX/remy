import { notFound } from 'next/navigation';
import { Button, Card, Icon, ICONS, PageHeader } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { formatLastMade } from '@/lib/recipes/history';
import { toRecipeFormValues } from '@/lib/recipes/mapping';
import { prisma } from '@/lib/prisma';
import {
  addRecipeCommentAction,
  deleteRecipeAction,
  markRecipeMadeAction,
  updatePersonalNoteAction,
  updateRecipeAction,
} from '../actions';
import { RecipeForm } from '../RecipeForm';
import { CommentForm } from './CommentForm';
import { PersonalNoteForm } from './PersonalNoteForm';

const SECTION_LABEL = 'font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400';

export default async function EditRecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const household = await getCurrentHousehold();
  const [recipe, ingredients] = await Promise.all([
    prisma.recipe.findFirst({
      where: { id, householdId: household.id },
      include: {
        ingredients: true,
        comments: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.ingredient.findMany({ where: { householdId: household.id }, orderBy: { name: 'asc' } }),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <main className="p-6 pb-32">
      <PageHeader title={recipe.name} backHref="/recettes" />

      <div className="mb-6 flex flex-col gap-3 rounded-lg bg-sand px-4 py-4 dark:bg-clay-800">
        <span className="font-mono text-[13px] text-clay-700 dark:text-clay-400">{formatLastMade(recipe.lastMadeAt)}</span>
        <form action={markRecipeMadeAction.bind(null, id)}>
          <Button type="submit" variant="secondary" icon={<Icon name={ICONS.fait} size={18} />} block>
            Marquer comme réalisée aujourd&apos;hui
          </Button>
        </form>
      </div>

      <RecipeForm
        action={updateRecipeAction.bind(null, id)}
        defaultValues={toRecipeFormValues(recipe)}
        submitLabel="Enregistrer"
        ingredientOptions={ingredients.map((ingredient) => ({ id: ingredient.id, name: ingredient.name }))}
      />

      <section className="mt-6 flex flex-col gap-3">
        <span className={SECTION_LABEL}>Note perso</span>
        <PersonalNoteForm action={updatePersonalNoteAction.bind(null, id)} defaultValue={recipe.personalNote ?? ''} />
      </section>

      <section className="mt-6 flex flex-col gap-3">
        <span className={SECTION_LABEL}>Commentaires</span>
        <CommentForm action={addRecipeCommentAction.bind(null, id)} />
        {recipe.comments.length === 0 ? (
          <p className="font-sans text-[13px] text-clay-700 dark:text-clay-400">Aucun commentaire pour l&apos;instant.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recipe.comments.map((comment) => (
              <Card key={comment.id} className="px-4 py-3">
                <p className="font-sans text-[14px] text-ink dark:text-cream">{comment.body}</p>
                <p className="mt-1 font-mono text-[11px] text-clay-700 dark:text-clay-400">
                  {new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
                    comment.createdAt,
                  )}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <form action={deleteRecipeAction.bind(null, id)} className="mt-6">
        <Button type="submit" variant="secondary" block>
          Supprimer
        </Button>
      </form>
    </main>
  );
}
