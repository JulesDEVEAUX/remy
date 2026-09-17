# remy

Assistant personnel de courses & recettes : stock, recettes, planning des repas, liste de courses.

Conventions de code, tests, revue et design : [CLAUDE.md](CLAUDE.md).
Contexte produit, scope MVP et décisions : [docs/CONTEXT.md](docs/CONTEXT.md).

## Stack

Next.js (App Router) + Prisma + Supabase (Postgres/Auth/Storage) + Tailwind, mobile-first, PWA.

## État actuel

- Authentification Supabase (email + code à 6 chiffres, `/login` et `/signup`) et onboarding
  foyer (`/onboarding` : nom du foyer + premiers mangeurs, déclenché automatiquement au
  premier accès)
- CRUD ingrédients livré (`/ingredients`)
- CRUD recettes livré (`/recettes`) : composition d'ingrédients existants (quantité + unité),
  saisons, tags, temps de préparation, lien source
- Gestion du stock livrée (`/stock`) : ajout/ajustement/retrait scopés au foyer, toujours
  rattachés à un ingrédient existant, liste triée par urgence de péremption (date estimée
  automatiquement si non saisie)
- Accueil (`/`) : résumé du foyer (stock qui périme bientôt, repas du jour), et
  Paramètres (`/parametres`) : nom du foyer, gestion des membres
- Interface visuelle (« Plan de travail », voir `docs/identite-visuelle.md`) appliquée sur
  toute l'app : navigation par onglets, tous les écrans ci-dessus habillés avec de vraies
  données. Courses (`/courses`) et Planning (`/planning`) sont posés en interface seule
  (jeu de données statique de démo), en attente de leur logique métier
- Moteur de suggestion, génération de liste de courses, logique de planning : pas commencés

## Développement

```bash
corepack enable
pnpm install
cp .env.example .env   # renseigner les clés Supabase (voir commentaires du fichier)
pnpm prisma:deploy
pnpm dev
```

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm test` — tests unitaires (Vitest)
- `pnpm test:e2e` — tests e2e (Playwright)
- `pnpm lint` / `pnpm typecheck`
- `pnpm prisma:migrate` / `pnpm prisma:deploy` / `pnpm prisma:generate`
