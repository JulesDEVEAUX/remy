---
description: Liste les issues GitHub ouvertes (tous types) et les corrige une par une, par ordre de priorité
---

Utilise `gh` (déjà authentifié) pour lister **toutes** les issues ouvertes de ce repo, tous labels
confondus (`gh issue list --state open --json number,title,body,labels`) — ne te limite pas au
label `bug`.

Exclus les régressions e2e automatiques : une issue dont un label a la description "Régression
détectée automatiquement" (actuellement le label `bug` généré par le workflow nocturne), ou dont
le titre commence par "Régression e2e nocturne". Ce sont des rapports auto-générés, pas des tâches
à traiter par ce flux.

Trie le reste par priorité de label avant de traiter :
1. `bug` — régressions/défauts réels, cassent quelque chose qui marchait.
2. `enhancement` — nouvelles fonctionnalités ou améliorations demandées.
3. tout autre label, ou aucun label — à la fin, dans l'ordre renvoyé par `gh`.

À égalité de priorité, traite par numéro décroissant (les plus récentes d'abord). S'il y a un
argument ($ARGUMENTS), ignore ce tri et traite uniquement l'issue portant ce numéro ; sinon
traite-les toutes, une par une, dans l'ordre de priorité ci-dessus.

Pour chaque issue :
1. Lis le détail complet (`gh issue view <numéro>`).
2. Crée une branche dédiée depuis `main`.
3. Corrige le problème décrit, ou implémente la fonctionnalité demandée si c'est une
   `enhancement`. Ajoute ou ajuste les tests concernés (Vitest pour la logique métier,
   Playwright pour un flux utilisateur critique) — voir `CLAUDE.md`.
4. Vérifie localement (`pnpm lint`, `pnpm typecheck`, `pnpm test`) avant de commit.
5. Commit, push la branche.
6. Ouvre une pull request avec `gh pr create` :
   - Titre au format `fix: ...` pour un `bug`, `feat: ...` pour une `enhancement` (voir
     convention PR dans `CLAUDE.md`)
   - Description qui contient `Closes #<numéro>`
7. Passe à l'issue suivante.

Ne merge jamais toi-même la PR — l'utilisateur relit et merge, sauf s'il te le demande
explicitement pour ce lot précis.
