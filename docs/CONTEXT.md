# Contexte produit — Remy (app courses & recettes)

Repo : https://github.com/JulesDEVEAUX/remy
Dernière mise à jour : 2026-09-17

## État du setup au 17/09/2026

- Repo GitHub créé et prêt
- Projet Supabase créé et prêt
- Rien n'est encore scaffoldé côté code : ce document est le point de départ

## Contexte et objectifs

- Outil personnel pour gérer les courses de bout en bout : stock, recettes, planning des repas, liste de courses.
- Usage initial solo. Architecture pensée pour ouvrir à d'autres foyers plus tard sans refonte.
- Objectif : réduire le temps de planification hebdo et le gaspillage lié aux produits périmés.

## Stack technique

- Framework : Next.js (App Router), front + API routes en mono-repo
- Base de données : Supabase (Postgres managé + Auth + Storage)
- ORM : Prisma — schéma canonique dans `prisma/schema.prisma`
- Style : Tailwind CSS, mobile-first
- PWA : manifest + service worker, installable sur mobile
- Déploiement : Vercel

Justification : usage principal sur navigateur mobile, besoin de scalabilité multi-utilisateurs sans gestion d'infra, row-level security de Supabase couvre nativement le futur multi-foyer.

## Modèle de données : entités principales

| Entité | Rôle |
| --- | --- |
| Household | Frontière multi-tenant, un foyer |
| Person | Un mangeur du foyer, allergies/restrictions persistantes |
| PersonPreference | Envie du jour par personne, liée à une date ou un repas |
| Ingredient | Catalogue ingrédients, catégorie, unité, durée de conservation |
| Recipe | Recette : source, instructions, saison, tags, note, dernière réalisation |
| RecipeIngredient | Liaison recette-ingrédient, quantité |
| Stock | Quantité en stock par ingrédient, date de péremption |
| ShoppingListItem | Item de liste de courses, catégorie, source d'achat |
| MealPlan | Repas planifié : date, recette, personnes concernées |

Champs nutrition prévus sur `Ingredient` mais non prioritaires pour le MVP (voir Risques et décisions ouvertes). Le schéma Prisma complet et à jour fait foi sur les détails de champs/types, pas ce tableau.

## Scope MVP (Tier 1) — ordre de build

1. CRUD ingrédients et recettes
2. Gestion du stock (ajout/retrait, péremption courte/moyenne/longue)
3. Moteur de suggestion de recettes (stock + saison + tags de préférence)
4. Génération de liste de courses groupée par catégorie, séparée Carrefour / hors-Carrefour
5. Planning hebdo configurable (nombre de repas, batch cooking, priorité aux produits proches péremption)
6. Commentaires et historique de réalisation par recette

## Roadmap V2 et bonus (pas avant que le Tier 1 soit stable)

- Import de recettes via URL externe (Marmiton et similaires)
- Analyse du stock par déclaration vocale
- Nutrition avancée : lookup automatique (Open Food Facts) et équilibrage assisté
- Intégration Carrefour en mode manuel uniquement : l'outil prépare la liste, validation du panier faite à la main (pas d'API publique Carrefour, scraping écarté)
- Ouverture à d'autres foyers (multi-tenant déjà prévu dans le modèle de données)

## Principes UX mobile

- Mobile-first, PWA installable sur écran d'accueil
- Écran recette : mode cuisine avec checklist tactile des ingrédients, scaler de portions
- Planning : vue swipeable par jour, pas de drag-and-drop (peu fiable au toucher)
- Liste de courses : cases à cocher, tri par rayon/catégorie
- Détail d'implémentation à affiner au moment du build avec un skill UI dédié

## Pipeline CI/CD agentique

- CI standard (`.github/workflows/ci.yml`) : lint, typecheck, tests unitaires, build, sur chaque push/PR, avec un Postgres de test
- Code Review : app GitHub Claude, review auto de chaque PR, sans fichier workflow
- Auto-fix (Claude Code on the web, recherche preview) : surveille CI et les commentaires de review sur une PR, pousse des correctifs automatiquement
- Nightly + fix par issue (`.github/workflows/nightly-regression.yml` + `claude-fix-issue.yml`) : suite e2e complète chaque nuit sur `main`, ouvre une issue labellisée `claude:fix` si échec, un agent corrige sur label
- Gate de merge humain conservé en phase initiale ; automatisation prévue une fois le pipeline éprouvé (décision utilisateur du 17/09/2026)

## Risques et décisions ouvertes

- Stack : Supabase retenu par défaut, réversible si le coût devient un problème à l'usage
- Nutrition : reportée après le MVP (décision utilisateur du 17/09/2026)
- Carrefour : pas d'API publique, solution manuelle uniquement retenue pour éviter le risque de blocage de compte (décision utilisateur du 17/09/2026)
- Risque agent CI : gate humain sur le merge en phase initiale ; automatisation prévue une fois le pipeline éprouvé (décision utilisateur du 17/09/2026)

## Fichiers de référence dans ce repo

- `prisma/schema.prisma` — schéma de données canonique
- `CLAUDE.md` — conventions de code, tests, revue
- `.github/workflows/ci.yml` — CI standard
- `.github/workflows/nightly-regression.yml` — suite e2e nocturne + ouverture d'issue
- `.github/workflows/claude-fix-issue.yml` — agent correcteur déclenché par label
