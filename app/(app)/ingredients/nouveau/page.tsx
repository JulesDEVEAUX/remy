import { PageHeader } from '@/components/ui';
import { pickRandomEmoji } from '@/lib/emoji';
import { safeRedirectTarget } from '@/lib/navigation';
import { createIngredientAction } from '../actions';
import { IngredientForm } from '../IngredientForm';

export default async function NewIngredientPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const backHref = safeRedirectTarget(redirectTo, '/ingredients');

  return (
    <main className="p-6 pb-32">
      <PageHeader title="Nouvel ingrédient" backHref={backHref} />
      <IngredientForm
        action={createIngredientAction}
        submitLabel="Ajouter"
        redirectTo={backHref}
        randomEmoji={pickRandomEmoji()}
      />
    </main>
  );
}
