# Contexte produit — Remy (app courses & recettes)

Repo : https://github.com/JulesDEVEAUX/remy
Dernière mise à jour : 2026-09-18

## État du setup au 17/09/2026

- Repo scaffoldé : Next.js (App Router) + Prisma + Tailwind, déploiement Vercel configuré
- Projet Supabase connecté (Postgres via Prisma ; Auth par email + code numérique à 6
  chiffres en place)
- Authentification : aucune n'existait avant le CRUD ingrédients ; ajoutée à cette
  occasion (d'abord lien magique par email, remplacé le 17/09/2026 par un mot de passe
  numérique à 6 chiffres) car le scoping par foyer en avait besoin — voir Risques et
  décisions ouvertes. `/login` et `/signup` coexistent, chacun avec sa propre Server
  Action (`signInWithPassword` / `signUp`), avec lien croisé entre les deux
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
- Liste de courses : génération réelle des besoins par `computeResidualQuantities`
  (`lib/shopping/`) — somme des `RecipeIngredient` des recettes planifiées de la
  semaine moins le `Stock` actuel, par ingrédient et par unité (pas de conversion
  d'unité). Page `/courses` : items groupés par rayon puis par source d'achat
  (`ShoppingListItem.source` : Carrefour / hors-Carrefour), coche persistée, ajout
  manuel d'un item hors recette, bouton « vider les cochés » — PR #19
- Commentaires et historique de réalisation par recette : note personnelle et
  commentaire libre sur `Recipe`, marquage « réalisé aujourd'hui » qui met à jour
  `Recipe.lastMadeAt` (aucun nouveau champ Prisma, réutilise le modèle existant)
  — PR #21
- Intégration Tier 1 : les 4 lots ci-dessus (suggestions, planning, courses,
  commentaires) intégrés depuis leurs branches respectives sur
  `integration/tier1-mvp` le 17/09/2026, PR ouverte vers `main` — voir Risques
  et décisions ouvertes pour le détail de l'intégration

## Corrections issues GitHub (label `bug`) — 18/09/2026

Six issues `bug` ouvertes traitées par lot via le skill `fix-issues` (une branche + une PR
par issue, mergées sur `main` après revue) :

- **Thème sombre** (#36, PR #43) : bascule Clair/Sombre dans Paramètres > Apparence,
  persistée par cookie, appliquée côté serveur sur `<html>` (pas de flash). Le thème
  sombre réutilise exclusivement les tokens existants (`ink`/`cream`/`clay-*`,
  `terracotta-300/400`) déjà utilisés pour le motif « mode cuisine » — aucune nouvelle
  valeur de couleur introduite, faute de direction dark définie dans
  `docs/identite-visuelle.md`. À valider visuellement par un futur passage design
- **Lenteur de chargement** (#35, PR #45) : `getCurrentHousehold()` (appelée sur
  *chaque* page et *chaque* server action) faisait un `upsert` — donc une écriture DB —
  à chaque requête ; lit désormais d'abord par `ownerUserId` (index unique) et ne
  retombe sur l'upsert que si le foyer n'existe pas encore. Ajout d'un `loading.tsx`
  sur le groupe `(app)` (aucun n'existait avant, l'écran restait figé pendant la
  résolution des données de la page suivante)
- **Génération de la liste de courses** (#33, PR #47) : part maintenant de tous les
  repas planifiés à venir (`MealPlan`) au lieu d'une sélection manuelle dans le
  catalogue de recettes. `selectPlannedRecipeOccurrences` (`lib/shopping/mapping.ts`)
  ne compte un batch cooking qu'une fois même s'il couvre plusieurs créneaux — voir
  Risques et décisions ouvertes pour la limite connue
- **Zoom involontaire iOS** (#32, PR #49) : les champs de formulaire (`FIELD` dans
  `components/ui/FormField.tsx`) étaient à 15px, sous le seuil de 16px qui déclenche un
  zoom automatique de Safari iOS au focus — passés à 16px. Pas de verrou
  `user-scalable=no` (casserait l'accessibilité, WCAG 1.4.4)
- **Barre d'onglets tronquée sur iPhone** (#26, PR #51) : `TabBar` empilait deux
  classes ciblant `padding-bottom` sur le même élément (`safe-bottom` + `pb-5`) — une
  seule s'appliquait réellement selon l'ordre de génération Tailwind. `safe-bottom`
  garantit maintenant seule un plancher de `1.25rem`
- **Navigation perdue lors d'un ajout** (#29, PR #53) : créer un ingrédient depuis le
  flux d'ajout au stock (catalogue vide) ou une recette depuis les suggestions
  renvoyait toujours vers `/ingredients`/`/recettes`, quel que soit le point de départ.
  `/ingredients/nouveau` et `/recettes/nouveau` acceptent un `?redirectTo=<chemin>`,
  revalidé côté serveur (`safeRedirectTarget`, `lib/navigation.ts`) pour éviter un open
  redirect — réutilisable pour tout futur flux « créer X depuis Y »

Les issues #31, #30, #28, #25 (relabellisées `enhancement` en cours de route) sont
restées hors périmètre de ce lot — voir skill `fix-issues` mis à jour ci-dessous. Traitées
dans le lot suivant, voir section « Lot d'enhancements ».

## Lot d'enhancements GitHub (issues #41, #40, #31, #30, #28, #25) — 18/09/2026

Sept issues restantes traitées à la suite du lot de bugs ci-dessus, via le même skill
`fix-issues` élargi (voir section CI/CD plus bas) : six `enhancement` + une relabellisée
`invalid` (#56) — aucune n'était un vrai `bug`. Une branche + une PR par issue,
**PR ouvertes, en attente de revue humaine** (pas encore mergées, contrairement au lot de
bugs ci-dessus) :

- **Besoins récurrents du foyer hors recettes** (#41, PR #59) : nouveau modèle
  `HouseholdNeed` (ingrédient + consommation mensuelle), section « Besoins récurrents »
  dans Paramètres. Converti en équivalent hebdomadaire (`lib/household-needs/quantity.ts`,
  prorata sur 365,25/12 jours) et intégré à `generateShoppingListAction` aux côtés des
  recettes planifiées
- **Plusieurs listes de courses en parallèle** (#40, PR #60) : nouveau modèle
  `ShoppingList` (nommée, scopée au foyer) ; `ShoppingListItem.shoppingListId` devient
  obligatoire, migration avec backfill (une liste « Courses » par défaut créée pour les
  items déjà en base). Sélecteur de liste sur `/courses` (pastilles + création),
  suppression possible sauf s'il ne reste qu'une liste
- **Catalogue ingrédients/recettes partagé entre foyers** (#31, PR #61) :
  `Ingredient.isPrivate` / `Recipe.isPrivate` (défaut `false` = public).
  `lib/ingredients/catalog.ts` centralise le filtre « mon foyer + tout ce qui est
  public », réutilisé pour toute sélection d'ingrédient (stock, recette, courses) —
  `/ingredients` (page de gestion CRUD) reste filtrée au foyer seul, seul le propriétaire
  édite/supprime. Une recette publique d'un autre foyer s'affiche en lecture seule avec
  un bouton « Ajouter à mon foyer » qui la **clone** plutôt que d'y référencer
  directement, pour ne jamais faire fuiter commentaires/note perso/historique de
  réalisation entre foyers. Nouveau composant transverse `CheckboxField`
  (`components/ui/FormField.tsx`), ajouté à la règle 2 de `CLAUDE.md`
- **Champs pré-remplis** (#30, PR #62) : choisir un ingrédient suggère désormais son
  unité par défaut dans le stock, la composition d'une recette et l'ajout manuel en
  courses. Pour le stock spécifiquement, la date de péremption estimée
  (`lib/stock/expiry.ts`, déjà existant comme filet de sécurité serveur) devient visible
  et éditable dans le formulaire au lieu d'un calcul silencieux uniquement si le champ
  est laissé vide
- **Liste déroulante d'unités** (#28, PR #63) : `lib/ingredients/units.ts` fige la liste
  fermée des unités proposées à la création d'un produit (notation scientifique
  respectée — `mL`/`cL`/`L`, jamais `ml`/`l`). Volontairement limité au champ
  `Ingredient.defaultUnit` : les champs unité libres ailleurs (ligne de recette, stock,
  courses) restent en texte libre, une ligne pouvant légitimement demander une unité
  hors du défaut du produit
- **Inviter un compte sur son foyer** (#25, PR #64) : `Household.inviteCode` (généré
  depuis Paramètres, partagé manuellement — pas d'email, cf. limites du mailer Supabase
  ci-dessous) + nouveau modèle `HouseholdMember`. Saisi en champ optionnel à
  l'inscription (`/signup`) : rattache le nouveau compte au foyer invité au lieu de lui
  en créer un. `getCurrentHousehold()` résout désormais dans l'ordre propriétaire →
  membre invité → création (coût de lecture supplémentaire nul sur le chemin le plus
  courant). `Person.linkedUserId` + case « c'est moi » dans Paramètres > Membres, un
  seul mangeur par compte
- **Bases de données de test** (#56, label `invalid`) : investigation seule, pas de PR.
  `.github/workflows/ci.yml` ne consomme aucun jeu de données de test — les tests
  unitaires utilisent des factories locales par fichier (mises à jour au fil de ce lot
  pour les nouveaux champs de schéma), `prisma/seed.mjs` (dev local uniquement, jamais
  exécuté en CI) reste cohérent avec le schéma actuel. Rien à corriger ; laissée ouverte
  à la demande de l'utilisateur

Travail réalisé dans un `git worktree` dédié (`remy-agent-fixissues`), conformément à la
recommandation plus bas sur le travail agent en parallèle. Les PR #59/#60/#61 modifient
toutes `app/(app)/courses/actions.ts` et `page.tsx` (besoins récurrents, listes
multiples, catalogue partagé) — conflit de merge probable entre elles, à résoudre en
conservant les trois apports plutôt qu'en écrasant l'un des deux.

Chaque migration de ce lot a été écrite et appliquée à la main (SQL direct via un script
`pg` temporaire, puis `prisma migrate resolve --applied`) plutôt que via
`prisma migrate dev`, qui refusait de générer un diff propre : la base de dev partagée
contenait déjà les tables des branches sœurs non mergées (ex. `HouseholdNeed` de la
PR #59 visible depuis la branche de la PR #60, alors fraîchement créée depuis `main`) —
un cas non couvert par le précédent similaire de l'intégration Tier 1 ci-dessous, propre
à plusieurs PR de schéma ouvertes en parallèle sans jamais avoir mergé entre elles. À
surveiller pour tout futur lot d'issues touchant le schéma sur cette base partagée.

## Lot bug+enhancement (issues #70, #66, #73) — 18/09/2026

Trois issues traitées via le skill `fix-issues`, une branche + une PR par issue, **mergées
sur `main` sur demande explicite de l'utilisateur pour ce lot précis** (dérogation à la
règle par défaut « l'utilisateur relit et merge ») :

- **Bug d'interface dans les settings** (#70, PR #74) : la ligne « Besoins récurrents »
  (Paramètres) et les lignes de la liste de courses (`CheckRow`) débordaient à droite dès
  que le nom du produit ou l'unité (jusqu'à 20 caractères, texte libre) étaient longs — ni
  le libellé ni la quantité n'avaient de contrainte de largeur dans la ligne flex. Ajout de
  `min-w-0 flex-1 truncate` sur le libellé et `max-w-[40%] shrink-0 truncate` sur la
  quantité
- **Je vois toutes les recettes de tests unitaires** (#66, PR #75) : `Ingredient`/`Recipe`
  sont publics par défaut (`isPrivate=false`, issue #31) et donc visibles dans le catalogue
  partagé de tout foyer — y compris ceux créés par les comptes e2e (`@remy.test`), qui
  polluaient le catalogue de chaque foyer réel. Nouveau champ `Household.isTestHousehold`
  (posé à la création selon le domaine de l'email, `lib/testing.ts`) exclu du catalogue
  partagé **uniquement pour un foyer réel** — un foyer de test continue de voir le
  catalogue public d'un autre foyer de test, condition nécessaire pour que
  `tests/e2e/ingredient-recipe-sharing.spec.ts` reste utilisable. Backfill des 28 foyers de
  test déjà en base appliqué à la main (jointure `auth.users`, hors migration versionnée
  car absente du Postgres nu de `ci.yml`). `prisma/seed.mjs` (dev local uniquement) enrichi
  d'une sélection plus large d'ingrédients/recettes par défaut, en remplacement du contenu
  de test qui polluait jusqu'ici le catalogue partagé
- **Emoji d'icône produit/recette** (#73, PR #76) : `Ingredient.emoji` / `Recipe.emoji`,
  choisi librement (nouveau composant transverse `EmojiField`, clavier emoji natif du
  téléphone) ou tiré au hasard (`lib/emoji.ts`) si laissé vide, avec un bouton pour
  retirer un tirage. `isSingleEmoji` valide un unique glyphe (`Intl.Segmenter` +
  `\p{Extended_Pictographic}`) plutôt que du texte brut ou plusieurs emojis. Le formulaire
  recette allongé par ce champ a rendu fragile un clic forcé existant dans
  `tests/e2e/recipes.spec.ts` (case saison `peer sr-only` cliquée par coordonnées, qui
  pouvait atterrir ailleurs une fois la page plus longue) — corrigé en cliquant le
  `<label>` visible plutôt que les coordonnées de l'input invisible, plus robuste aux
  futurs ajouts de champs

Le critère d'exclusion des régressions e2e auto-générées du skill (description de label)
s'est révélé trop large en pratique : le label `bug` du repo n'a qu'une seule instance,
et sa description globale (écrasée par le workflow nocturne) matchait aussi bien #70 et
#66, qui sont de vrais bugs signalés manuellement. Décision utilisateur du 18/09/2026 :
se fier au motif de titre « Régression e2e nocturne — » comme signal fiable pour ces
trois issues plutôt qu'à la description du label — traiter #70/#66 normalement. À
corriger dans `.claude/commands/fix-issues.md` si le label `bug` continue de porter cette
description (idéalement un label dédié pour les régressions auto, distinct de `bug`)

Chaque worktree a été créé au moment de constater le risque de collision de branche dans
le répertoire de travail principal (cf. note plus bas sur le travail agent en parallèle) —
l'issue #70 a donc été traitée directement dans ce répertoire (checkout de branche, pas de
worktree dédié), les issues #66 et #73 dans des worktrees dédiés
(`remy-agent-issue66`, `remy-agent-issue73`). Aucune collision constatée cette fois, mais
à traiter en worktree dédié dès la première issue à l'avenir. Un serveur `next dev`
partagé tournant depuis une autre session a été rencontré avec un client Prisma
désynchronisé du schéma courant (`prisma.householdMember` undefined) — confirme qu'un
`pnpm dev`/`next build` lancé pour vérifier localement doit utiliser un `PORT` dédié dans
un worktree séparé plutôt que de compter sur `reuseExistingServer`, qui se rattache au
premier serveur trouvé sur le port par défaut sans égard à la branche qui l'a démarré.

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
- **Courses** : passé de placeholder design à logique réelle avec l'intégration Tier 1
  (voir État du setup) — le bouton « Copier pour Carrefour » reste désactivé (roadmap
  V2, intégration Carrefour manuelle uniquement)
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
4. Génération de liste de courses groupée par catégorie, séparée Carrefour /
   hors-Carrefour (fait)
5. Planning hebdo configurable (fait) : nombre de repas, batch cooking, priorité aux
   produits proches péremption
6. Commentaires et historique de réalisation par recette (fait)

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
- Skill `fix-issues` (`.claude/commands/fix-issues.md`) élargi le 18/09/2026 : traite
  désormais toutes les issues ouvertes tous labels confondus (plus seulement `bug`),
  triées par priorité de label (`bug` > `enhancement` > autre/sans label), toujours en
  excluant les régressions e2e auto-générées (détectées par la description du label,
  pas seulement par le titre)
- Travail agent en parallèle sur le même repo : plusieurs sessions Claude Code peuvent
  opérer simultanément sur ce repo (ex. correction d'issues + stabilisation e2e le
  18/09/2026). Le répertoire de travail principal est partagé entre sessions : changer
  de branche dans ce répertoire pendant qu'une autre session y travaille lui « vole »
  sa branche sous les pieds. Utiliser un `git worktree` dédié par session évite la
  collision ; en cas de conflit malgré tout (deux sessions créant le même nouveau
  fichier, ex. `tests/e2e/support/planning.ts` le 18/09/2026), résoudre en conservant
  les deux apports plutôt qu'en écrasant l'un des deux

## Risques et décisions ouvertes

- Stack : Supabase retenu par défaut, réversible si le coût devient un problème à l'usage
- Nutrition : reportée après le MVP (décision utilisateur du 17/09/2026)
- Carrefour : pas d'API publique, solution manuelle uniquement retenue pour éviter le risque de blocage de compte (décision utilisateur du 17/09/2026)
- Risque agent CI : gate humain sur le merge en phase initiale ; automatisation prévue une fois le pipeline éprouvé (décision utilisateur du 17/09/2026)
- Auth : le repo n'avait aucune authentification avant le CRUD ingrédients. Plutôt que de
  stubber le foyer, Supabase Auth a été implémenté à cette occasion — d'abord lien
  magique par email (décision utilisateur du 17/09/2026), remplacé le même jour par un
  mot de passe numérique à 6 chiffres après avoir buté sur le rate limit du mailer par
  défaut de Supabase (`over_email_send_rate_limit`, ~2-4 emails/heure) déclenché à
  chaque connexion — voir issue #15. Les données de l'app ne sont pas sensibles (usage
  foyer privé), donc pas de politique de mot de passe élaborée ; confirmation d'email
  désactivée côté Supabase (`mailer_autoconfirm`) pour qu'aucun email ne soit plus
  envoyé ni au login ni au signup. Pas de flow « code oublié » pour l'instant — suite
  naturelle possible en réutilisant le lien magique (déjà corrigé côté redirection prod).
  Un utilisateur = un foyer pour l'instant (`Household.ownerUserId`, créé au premier
  accès) ; l'ouverture à plusieurs membres par foyer reste à faire, sans refonte de
  schéma attendue — traitée dans la PR #64 (issue #25, voir section « Lot
  d'enhancements » plus haut), non mergée à date de cette note
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
- Génération de liste de courses depuis le planning (18/09/2026, #33) : `MealPlan` n'a
  pas d'identifiant de lot batch dédié — si la même recette est batch-cookée deux fois
  séparément (deux lots distincts dans le temps), `selectPlannedRecipeOccurrences` ne
  peut pas les distinguer d'un seul lot étendu et ne comptera qu'une occurrence au lieu
  de deux. Documenté dans `tests/unit/shopping/mapping.test.ts`. Un `batchGroupId`
  dédié réglerait ça si le cas se présente en usage réel, mais jugé hors scope tant que
  ce n'est qu'une hypothèse
- Intégration Tier 1 (17/09/2026) : les 4 branches suggestions/courses/planning/
  commentaires ont toutes mergé proprement (aucun conflit) sur `integration/tier1-mvp`
  car chacune avait déjà été créée depuis `main` (ou, pour planning, depuis la branche
  suggestions déjà avancée) plutôt que divergé en parallèle. Vérifié explicitement que
  `lib/planning/picker.ts` appelle `rankRecipes`/`toSuggestionViewModel` avec la
  signature réelle de `lib/suggestions/`. Bug trouvé et corrigé au passage : un octet
  NUL littéral dans le séparateur de clé de `computeResidualQuantities`
  (`lib/shopping/quantity.ts`), qui faisait détecter le fichier comme binaire par git —
  remplacé par `::`. Homogénéité déjà correcte sans retouche nécessaire : les 4 lots
  utilisent tous `getCurrentHousehold()` pour le scoping foyer et réutilisent
  `components/ui/` sans divergence. `feat/auth-password` (PR #20) est une 5e PR ouverte
  en parallèle mais hors scope de cette intégration (n'appartient à aucun des 5 lots
  Tier 1) — non touchée. Tests e2e Playwright non rejoués localement faute de Postgres/
  Docker disponible sur la machine d'intégration (le `webServer` Playwright pointerait
  sinon sur le vrai Supabase de dev, partagé avec l'usage manuel en parallèle) ; lint,
  typecheck, tests unitaires et build ont été revérifiés verts après chaque merge — ce
  qui correspond au gate réel de `ci.yml` (l'e2e n'y tourne pas non plus par PR,
  seulement en nightly sur `main`)
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
