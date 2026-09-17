import { createIngredientAction } from '../actions';
import { IngredientForm } from '../IngredientForm';

export default function NewIngredientPage() {
  return (
    <main className="min-h-screen bg-cream p-6 pb-28">
      <h1 className="mb-6 font-display text-[30px] text-ink">Nouvel ingrédient</h1>
      <IngredientForm action={createIngredientAction} submitLabel="Ajouter" />
    </main>
  );
}
