# Contexte produit — Remy (app courses & recettes)

Repo : https://github.com/JulesDEVEAUX/remy
Dernière mise à jour : 2026-09-17

## État du setup au 17/09/2026

- Repo scaffoldé : Next.js (App Router) + Prisma + Tailwind, déploiement Vercel configuré
- Projet Supabase connecté (Postgres via Prisma ; Auth par lien magique en place)
- Authentification : aucune n'existait avant le CRUD ingrédients ; ajoutée à cette
  occasion (lien magique par email, pas de mot de passe) car le scoping par foyer en
  avait besoin — voir Risques et décisions ouvertes. `/login` et `/signup` coexistent
  désormais (même formulaire, même logique Supabase — `signInWithOtp` crée le compte
  au besoin), avec lien croisé entre les deux — PR #6
- Ingrédients : CRUD complet livré et mergé sur `main` (lister/créer/éditer/supprimer,
  scopé au foyer de l'utilisateur connecté) — PR #1
- Recettes : CRUD complet livré et mergé sur `main` (lister/créer/éditer/supprimer,
  composition dynamique de `RecipeIngredient` à partir du catalogue d'ingrédients du
  foyer — pas de création d'ingrédient à la volée depuis ce formulaire) — PR #3.
  Commentaires/historique de réalisation (point 6 du scope MVP) volontairement laissés
  hors scope de cette PR
- Stock : CRUD complet livré et mergé sur `main` (lister/ajouter/ajuster la
  quantité/retirer, scopé au foyer, référence toujours un `Ingredient` existant du
  catalogue) — PR #4. Liste triée par urgence de péremption ; date de péremption
  estimée automatiquement si non saisie, à partir de la durée de conservation de
  l'ingrédient (voir Risques et décisions ouvertes pour les valeurs retenues)
- Onboarding foyer : `/onboarding` (nom du foyer + ajout des premiers `Person`)
  déclenché automatiquement depuis `app/auth/confirm/route.ts` quand le foyer résolu
  n'a encore aucun `Person` — PR #7. `Person` est donc réellement peuplé désormais,
  plus seulement un modèle Prisma en attente
- Paramètres (`/parametres`) : nom du foyer éditable, gestion des membres
  (ajout/suppression de `Person`), section préférences encore en placeholder — PR #16
- Interface visuelle appliquée sur l'ensemble de l'app (voir section « Design /
  interface » ci-dessous) — PR #5, #6, #7, #8/#14, #9/#12, #10/#13, #11/#16
- Moteur de suggestion de recettes : `lib/suggestions/` (logique pure, aucune
  dépendance à une route Next.js) note chaque recette du foyer à partir du taux de
  couverture de ses `RecipeIngredient` par le `Stock` actuel (poids dominant), avec
  bonus si un ingrédient utilisé périme bientôt et si la saison courante correspond
  à `Recipe.seasons` (ou `TOUTE_ANNEE`). Page `/suggestions` : top recettes triées par
  score avec badges de justification, filtre par tag qui boost le score au lieu de
  filtrer en dur. Voir Risques et décisions ouvertes pour les poids retenus
- Planning hebdo : `lib/planning/` génère les créneaux `MealPlan` d'une semaine (7 jours
  × nombre de repas/jour configuré) à partir d'une date de début choisie par
  l'utilisateur, idempotent grâce à une contrainte d'unicité `(householdId, date,
  mealType)` ajoutée sur `MealPlan`. Page `/planning` : configuration initiale, vue
  swipeable par jour et vue résumé (indicateur sur les créneaux sans recette), avec
  navigation semaine précédente/suivante. Assignation d'une recette par créneau sur
  `/planning/[mealPlanId]`, sélecteur trié par le moteur de suggestion existant
  (priorité péremption proche). Flag `isBatch` : une recette ne peut couvrir plusieurs
  créneaux de la semaine que si le batch cooking est explicitement coché (validation
  serveur), pour réutiliser un même plat sans dupliquer la recette. Section « Repas du
  jour » de l'Accueil alimentée par les vrais créneaux du jour. Voir Risques et
  décisions ouvertes pour le mapping nombre de repas → types de repas retenu
- Liste de courses : logique métier pas commencée (interface posée en placeholder,
  voir ci-dessous)

## Design / interface — état au 17/09/2026

Le système de design « Plan de travail » (`docs/identite-visuelle.md`) est appliqué
sur l'ensemble de l'app, en parallèle du développement fonctionnel. Découpé en 7 PR
mergées sur `main` (voir aussi `CLAUDE.md`, section Design / UI, pour les règles
opposables en review) :

- **Coquille** : groupe de routes `app/(app)` avec `TabBar` fixe (5 onglets — Accueil,
  Recettes, Stock, Courses, Planning ; Ingrédients accessible depuis Recettes/Stock,
  pas d'onglet dédié) ; nouveaux composants transverses `PageHeader` et `EmptyState`
  dans `components/ui/`, ajoutés à la liste de la règle 2 de `CLAUDE.md`
- **Écrans habillés avec de vraies données** : Accueil (résumé — stock qui périme
  bientôt, repas du jour), Ingrédients, Recettes, Stock, Paramètres, Suggestions,
  Planning (configuration, vue par jour en scroll-snap + vue résumé, écran d'assignation
  par créneau)
- **Écrans en placeholder design uniquement** (pas de logique métier, jeu de données
  statique de démo) : Courses (RayonGroup + CheckRow, coche visuelle non persistée,
  bouton « Copier pour Carrefour » désactivé) — en attente du dev fonctionnel
  correspondant (point 4 du scope MVP)
- **Changement de comportement notable** : `/` (Accueil) nécessite désormais une
  session, alors que c'était un écran statique public avant — attendu pour un résumé
  personnalisé au foyer

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

`Household` porte désormais `ownerUserId` (id d'un utilisateur Supabase Auth) pour le
scoping par foyer — un utilisateur = un foyer pour l'instant (voir Risques et décisions
ouvertes).

## Scope MVP (Tier 1) — ordre de build

1. CRUD ingrédients (fait, PR #1) et recettes (fait, PR #3)
2. Gestion du stock (fait, PR #4) : ajout/ajustement/retrait, péremption
   courte/moyenne/longue
3. Moteur de suggestion de recettes (fait) : stock + saison + tags de préférence
4. Génération de liste de courses groupée par catégorie, séparée Carrefour / hors-Carrefour
5. Planning hebdo configurable (fait) : nombre de repas, batch cooking, priorité aux
   produits proches péremption
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
- Auth : le repo n'avait aucune authentification avant le CRUD ingrédients. Plutôt que de
  stubber le foyer, Supabase Auth a été implémenté à cette occasion — lien magique par
  email, pas de mot de passe (décision utilisateur du 17/09/2026). Un utilisateur = un
  foyer pour l'instant (`Household.ownerUserId`, créé au premier accès) ; l'ouverture à
  plusieurs membres par foyer reste à faire, sans refonte de schéma attendue
- Pipeline CI/CD : `nightly-regression.yml` ne pouvait en réalité jamais s'exécuter avec
  succès avant le 17/09/2026 (conflit de version pnpm, navigateurs Playwright non
  installés, flag `--run` invalide pour Playwright) — corrigé au passage dans la PR #1,
  premier run vert confirmé le 17/09/2026
- Stock : durées d'estimation de péremption (courte = 5 j, moyenne = 14 j, longue =
  180 j, appliquées à la date d'ajout quand l'utilisateur ne saisit pas de date) fixées
  par défaut dans `lib/stock/expiry.ts` faute de valeurs spécifiées au PRD — à revoir si
  elles s'avèrent trop génériques à l'usage, éventuellement par ingrédient plutôt que
  par seule durée de conservation
- Suggestions : poids de score (couverture stock ×60, bonus péremption proche +25,
  bonus saison +15, boost +10 par tag filtré sélectionné) et seuil « périme bientôt »
  (5 jours, ou conservation courte quelle que soit la date) fixés par défaut dans
  `lib/suggestions/score.ts` faute de valeurs spécifiées au PRD — de même pour le
  découpage des saisons météo par mois dans `lib/suggestions/season.ts`. À affiner à
  l'usage, comme les durées de péremption du stock ci-dessus
- Planning : mapping nombre de repas/jour → types de repas non spécifié au PRD, retenu
  par défaut dans `lib/planning/slots.ts` (1 → dîner ; 2 → déjeuner, dîner ; 3 → +
  petit-déjeuner ; 4 → + collation). Portée de la règle de réutilisation batch cooking
  (une recette sur plusieurs créneaux nécessite `isBatch`) limitée à la semaine affichée,
  faute de portée précisée au PRD. À affiner à l'usage
- Git/PR empilées et squash merge : GitHub ne retargete pas automatiquement une PR
  dont la branche de base est supprimée après merge — il la ferme, et une PR fermée
  dont la base a disparu ne peut plus être rouverte ni retargetée (`gh pr edit --base`
  échoue). Rencontré lors du merge des 7 PR du découpage design (17/09/2026) : les PR
  empilées sur une branche de base déjà supprimée ont dû être recréées, rebasées sur
  `main` (git élimine alors automatiquement les commits déjà appliqués via le squash)
  puis re-mergées. À anticiper pour tout futur découpage en PR empilées : soit éviter
  de supprimer une branche de base tant que ses PR dépendantes existent, soit rebaser
  chaque PR dépendante sur `main` juste avant de la merger

## Fichiers de référence dans ce repo

- `prisma/schema.prisma` — schéma de données canonique
- `CLAUDE.md` — conventions de code, tests, revue, design
- `docs/identite-visuelle.md` — spec visuelle complète (marque, palette, type, icônes, écrans)
- `components/ui/` — composants de design system partagés (voir `index.ts` pour la liste à jour)
- `.github/workflows/ci.yml` — CI standard
- `.github/workflows/nightly-regression.yml` — suite e2e nocturne + ouverture d'issue
- `.github/workflows/claude-fix-issue.yml` — agent correcteur déclenché par label
