# Remy — identité visuelle (direction « Plan de travail »)

Paquet de handoff prêt à déposer dans le repo `JulesDEVEAUX/remy`.
Chaque fichier est déjà au bon chemin : copie l'arborescence à la racine du projet.

```
app/globals.css                 # tokens (Tailwind v4) + base layer
app/fonts.ts                    # next/font : Caprasimo, Figtree, JetBrains Mono
app/manifest.ts                 # manifest PWA (couleurs + icônes)
tailwind.config.ts              # à utiliser SEULEMENT si tu es en Tailwind v3
components/ui/Wordmark.tsx
components/ui/Icon.tsx
components/ui/Button.tsx
components/ui/Tag.tsx
components/ui/Card.tsx
components/ui/CheckRow.tsx
components/ui/RayonGroup.tsx
components/ui/PortionStepper.tsx
components/ui/TabBar.tsx
components/ui/index.ts
public/icon.svg
public/icon-maskable.svg
docs/identite-visuelle.md       # la spec : marque, palette, type, icônes, écrans
docs/CLAUDE-design.md           # bloc à coller dans CLAUDE.md
```

## Installation

```bash
npm i lucide-react clsx
```

Tailwind v4 (recommandé) : rien d'autre à faire, `app/globals.css` porte les tokens
via `@theme`. Tailwind v3 : garde `tailwind.config.ts` et remplace l'en-tête de
`globals.css` par les directives `@tailwind base/components/utilities`.

Dans `app/layout.tsx` :

```tsx
import './globals.css';
import { fontVars } from './fonts';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={fontVars}>
      <body>{children}</body>
    </html>
  );
}
```

Référence visuelle : le fichier `Remy - Identité visuelle.dc.html` (projet de design)
montre les trois écrans en situation — accueil, courses, mode cuisine.

## Mise à jour post-handoff (17/09/2026)

Ce paquet documente la livraison initiale du design system. Depuis, deux composants
transverses ont été ajoutés directement dans le repo (pas dans ce paquet) au fil de
l'application du design sur l'ensemble des écrans : `components/ui/PageHeader.tsx`
et `components/ui/EmptyState.tsx`. État d'avancement complet de l'application du
design à jour dans `docs/CONTEXT.md`, section « Design / interface ».
