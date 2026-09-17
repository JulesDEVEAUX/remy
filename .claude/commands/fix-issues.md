---
description: Liste les issues GitHub ouvertes (label bug) et les corrige une par une
---

Utilise `gh` (déjà authentifié) pour lister les issues ouvertes avec le label `bug` sur ce repo
(`gh issue list --label bug --state open --json number,title,body`). S'il y a un argument
($ARGUMENTS), traite uniquement l'issue portant ce numéro ; sinon traite-les toutes, une par une.

Pour chaque issue :
1. Lis le détail complet (`gh issue view <numéro>`).
2. Crée une branche dédiée depuis `main`.
3. Corrige le problème décrit. Ajoute ou ajuste les tests concernés (Vitest pour la logique
   métier, Playwright pour un flux utilisateur critique) — voir `CLAUDE.md`.
4. Vérifie localement (`pnpm lint`, `pnpm typecheck`, `pnpm test`) avant de commit.
5. Commit, push la branche.
6. Ouvre une pull request avec `gh pr create` :
   - Titre au format `fix: ...` (voir convention PR dans `CLAUDE.md`)
   - Description qui contient `Closes #<numéro>`
7. Passe à l'issue suivante.

Ne merge jamais toi-même la PR — l'utilisateur relit et merge.
