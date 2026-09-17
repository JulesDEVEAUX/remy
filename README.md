# remy

Assistant personnel de courses & recettes : stock, recettes, planning des repas, liste de courses.

Conventions de code, tests, revue et design : [CLAUDE.md](CLAUDE.md).
Contexte produit, scope MVP et décisions : [docs/CONTEXT.md](docs/CONTEXT.md).

## Stack

Next.js (App Router) + Prisma + Supabase (Postgres/Auth/Storage) + Tailwind, mobile-first, PWA.

## État actuel

- Authentification Supabase (lien magique par email) et CRUD ingrédients livrés (`/ingredients`)
- CRUD recettes livré (`/recettes`) : composition d'ingrédients existants (quantité + unité),
  saisons, tags, temps de préparation, lien source
- Gestion du stock développée (`/stock`, PR en attente de merge) : ajout/ajustement/retrait
  scopés au foyer, toujours rattachés à un ingrédient existant, liste triée par urgence de
  péremption (date estimée automatiquement si non saisie)
- Moteur de suggestion, liste de courses, planning : pas commencés

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
