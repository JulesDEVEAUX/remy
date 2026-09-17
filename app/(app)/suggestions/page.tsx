import Link from 'next/link';
import { Button, Card, CardMeta, CardTitle, EmptyState, ICONS, PageHeader, Tag } from '@/components/ui';
import { getCurrentHousehold } from '@/lib/household';
import { prisma } from '@/lib/prisma';
import { rankRecipes } from '@/lib/suggestions/score';
import { extractAvailableTags, toSuggestionViewModel } from '@/lib/suggestions/mapping';

const SUGGESTION_LIMIT = 8;

function parseSelectedTags(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function buildTagsHref(tags: string[]): string {
  if (tags.length === 0) return '/suggestions';
  const params = new URLSearchParams();
  for (const tag of tags) params.append('tags', tag);
  return `/suggestions?${params.toString()}`;
}

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tags?: string | string[] }>;
}) {
  const { tags } = await searchParams;
  const selectedTags = parseSelectedTags(tags);

  const household = await getCurrentHousehold();
  const [recipes, stockEntries] = await Promise.all([
    prisma.recipe.findMany({ where: { householdId: household.id }, include: { ingredients: true } }),
    prisma.stock.findMany({ where: { householdId: household.id }, include: { ingredient: true } }),
  ]);

  const availableTags = extractAvailableTags(recipes);
  const now = new Date();
  const ranked = rankRecipes(recipes, stockEntries, { now, boostedTags: new Set(selectedTags) });
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]));

  const suggestions = ranked.slice(0, SUGGESTION_LIMIT).map((suggestion) => {
    const recipe = recipeById.get(suggestion.recipeId);
    if (!recipe) return null;
    return toSuggestionViewModel(recipe, suggestion);
  });

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Suggestions" />

      {availableTags.length > 0 && (
        <div className="mb-6 flex flex-col gap-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-clay-700 dark:text-clay-400">
            Filtrer par tag
          </span>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              const nextTags = active ? selectedTags.filter((t) => t !== tag) : [...selectedTags, tag];
              return (
                <Link key={tag} href={buildTagsHref(nextTags)}>
                  <Tag tone={active ? 'saison' : 'neutre'}>{tag}</Tag>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {recipes.length === 0 ? (
        <EmptyState
          icon={ICONS.cuisine}
          title="Aucune recette pour l'instant."
          description="Ajoute des recettes pour recevoir des suggestions."
          action={
            <Link href="/recettes/nouveau">
              <Button variant="secondary">Ajouter une recette</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {suggestions.map((suggestion) => {
            if (!suggestion) return null;
            return (
              <Link key={suggestion.id} href={`/recettes/${suggestion.id}`}>
                <Card className="flex flex-col gap-2 p-5" elevated>
                  <CardTitle>{suggestion.name}</CardTitle>
                  <CardMeta>
                    <span className="font-mono">{suggestion.coveragePercentLabel} en stock</span>
                    {suggestion.prepMinutesLabel && <span className="font-mono">{suggestion.prepMinutesLabel}</span>}
                  </CardMeta>
                  {suggestion.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {suggestion.badges.map((badge) => (
                        <Tag key={badge.label} tone={badge.tone}>
                          {badge.label}
                        </Tag>
                      ))}
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
