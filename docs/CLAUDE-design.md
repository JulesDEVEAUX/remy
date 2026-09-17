<!-- Bloc à coller dans CLAUDE.md, section « Design / UI » -->

## Design / UI

La direction visuelle est spécifiée dans `docs/identite-visuelle.md` (direction
« Plan de travail », dérivée du design system Organic). À lire avant toute tâche UI.

Règles opposables en review :

1. **Jamais de valeur en dur.** Couleurs, fontes, rayons, ombres et espacements
   passent par les tokens de `app/globals.css` (`bg-cream`, `text-terracotta-700`,
   `rounded-lg`, `shadow-md`, `font-display`…). Un `#` hexadécimal dans un
   composant est un bug.
2. **Réutiliser `components/ui/`** (Button, Tag, Card, CheckRow, RayonGroup,
   PortionStepper, TabBar, Wordmark, Icon, ListRow, TextField, SelectField,
   TextareaField) plutôt que restyler du HTML brut. Nouveau besoin transverse →
   nouveau composant dans `components/ui/`.
3. **Icônes uniquement via `<Icon name="…" />`** (stroke 2.75 imposé). Pas
   d'import direct de `lucide-react` dans un écran.
4. **Sémantique couleur** : terracotta = action/urgence · sauge = stock et
   validation · argile = information froide. Une seule action primaire par écran.
5. **Mobile-first, au doigt** : cibles ≥ 44px, ligne entière cliquable, pas de
   drag-and-drop, pas de survol comme seul affordant.
6. **Type** : Caprasimo pour les titres courts uniquement, Figtree pour le corps,
   JetBrains Mono pour les quantités et les libellés techniques. Minimum 11px.
7. **Ton de la copie** : majordome — deuxième personne du singulier, phrases
   courtes, pas d'emoji, pas de félicitations.
8. **Formes** : tout ce qui est interactif est en pastille (`rounded-full`),
   les conteneurs en `rounded-lg`. Aucun angle vif.

Si une maquette manque pour une fonctionnalité, implémenter en réutilisant
l'anatomie d'écran la plus proche décrite en section 7 de `docs/identite-visuelle.md`
plutôt que d'inventer un nouveau motif.
