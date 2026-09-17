import { PageHeader } from '@/components/ui';
import { createIngredientAction } from '../actions';
import { IngredientForm } from '../IngredientForm';

export default function NewIngredientPage() {
  return (
    <main className="p-6 pb-32">
      <PageHeader title="Nouvel ingrédient" backHref="/ingredients" />
      <IngredientForm action={createIngredientAction} submitLabel="Ajouter" />
    </main>
  );
}
