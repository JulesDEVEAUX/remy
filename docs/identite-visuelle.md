# Remy — identité visuelle

Direction retenue : **Plan de travail**. Crème, terracotta franc, tout en pastilles.
Dérivée du design system Organic. Ce document est la source de vérité visuelle :
si le code et ce fichier divergent, c'est le code qu'on corrige.

## 1. La marque

Remy est un **majordome** : il range, il rappelle, il propose, et il ne monopolise
jamais la parole. Conséquences concrètes :

- l'app ne félicite pas, ne gamifie pas, n'utilise pas d'emoji ;
- elle parle à la deuxième personne du singulier, en phrases courtes ;
- une seule action mise en avant par écran (une seule pastille terracotta pleine).

**Wordmark** : `remy` en Caprasimo bas de casse, suivi d'un **point terracotta**.
Le point est le symbole du produit : il signifie « c'est fait » — il se retrouve dans
les cases cochées et la pastille de l'onglet actif.

- Jamais en capitales, jamais étiré, jamais condensé.
- Taille minimale : 18px de haut. Sous cette taille, on garde l'icône seule.
- Zone de respect : la hauteur du « r » sur les quatre côtés.
- Monochrome autorisé : encre sur crème, ou crème sur encre (le point disparaît si
  l'impression est en une seule couleur).

**Icône PWA** : carré arrondi terracotta (rayon 30% du côté), « r » crème centré.
Fournie en `public/icon.svg` (+ version maskable sans arrondi).

## 2. Couleur

| Rôle | Token | Hex |
| --- | --- | --- |
| Fond d'app | `cream` | #F5EAD8 |
| Surfaces, cartes, barre d'onglets | `sand` | #EBDDC5 |
| Texte, mode cuisine | `ink` | #201E1D |
| Accent principal | `terracotta` | #C67139 |
| Seconde voix | `sage` | #7A8A5E |
| Neutres chauds | `clay-100…900` | — |

**Sémantique — non négociable, c'est ce qui rend l'app lisible d'un coup d'œil :**

- **terracotta** = action et urgence. Boutons primaires, alertes de péremption,
  quantités en mode cuisine. Rien d'autre.
- **sauge** = abondance et validation. « 100% en stock », « de saison », case cochée.
- **argile** = information froide. Métadonnées, sources d'achat, états passés.

Règles de contraste : le terracotta plein n'est jamais utilisé pour du texte courant
sur crème — passer à `terracotta-700` (#8C491A). Sur fond terracotta, le texte est
en `terracotta-100` (#FFF2EB), pas en blanc pur.

Deux fonds au maximum par écran (crème + sable), ou l'encre en plein pour le mode cuisine.
Pas de dégradé. Pas de gris froid : la chaleur est le point.

## 3. Typographie

| Voix | Fonte | Usage |
| --- | --- | --- |
| Display | **Caprasimo** 400 | Titres de 4 mots max, noms de recettes, wordmark, chiffre des couverts |
| Corps | **Figtree** 400/600/700 | Tout le reste : listes, boutons, libellés |
| Technique | **JetBrains Mono** 400/500 | Quantités, unités, dates, compteurs, en-têtes en capitales |

Échelle mobile : titre d'écran 30–34px · titre de recette 20px · corps 14–15px ·
méta 12px · technique 10–11px avec `letter-spacing` 0.1em en capitales.
Jamais en dessous de 11px, et jamais de Caprasimo sous 16px (illisible).

## 4. Formes, espace, élévation

- Rayons : `sm` 8px (cases) · `md` 16px (lignes) · `lg` 28px (cartes) · `full` pour
  tout ce qui est interactif. **Aucun angle vif.**
- Cibles tactiles : 44px minimum, 46–48px pour les lignes cochables. Toute la ligne
  est cliquable, pas seulement la case.
- Élévation : `shadow-sm/md/lg`, ombres teintées encre. Jamais de noir pur.
- Les formes rondes ont besoin d'air : padding horizontal d'écran 24px, respiration
  verticale 14–20px entre blocs.

## 5. Icônes

Lucide, **stroke-width 2.75** partout — imposé par `components/ui/Icon.tsx`.
Un sens, une icône (voir la constante `ICONS`) : `ChefHat` cuisine · `Refrigerator`
stock · `CalendarDays` semaine · `ShoppingBasket` courses · `Carrot` fruits et légumes ·
`Milk` crèmerie · `Package` épicerie · `Store` hors-Carrefour · `ClockAlert` péremption ·
`Snowflake` congelé · `Timer` durée · `Leaf` saison · `Mic` déclaration vocale.

Taille : 20–21px en barre d'onglets et en-têtes, 15–16px en ligne de texte, 24px
dans une pastille décorative. Jamais d'icône seule sans libellé dans la navigation.

## 6. Imagerie

Les photos de plats sont **lavées** : légèrement désaturées et contrastées à la baisse,
coins arrondis (`lg`), pour qu'elles s'assoient dans la page crème au lieu de flotter
dessus. En l'absence de photo, on affiche l'emplacement rayé (`PhotoSlot`) — un
placeholder assumé vaut mieux qu'une illustration générique.

## 7. Anatomie des écrans

Trois écrans de référence (voir le fichier de design du projet) :

**Accueil — « Ce soir, je propose ça »**
Wordmark + cloche · titre Caprasimo sur deux lignes · date et couverts en méta ·
segmented Suggestions / Stock / Semaine · bandeau terracotta-200 des produits à finir ·
carte de suggestion pleine largeur (photo + badge sauge « 100% en stock ») ·
suggestions secondaires en lignes compactes · barre d'onglets.

**Courses**
Titre + compteur d'articles restants · groupes par rayon (`RayonGroup`), source d'achat
alignée à droite · lignes cochables · pied collant : répartition Carrefour / hors-Carrefour
et une seule action « Copier pour Carrefour » (l'intégration reste manuelle, cf. PRD).

**Mode cuisine**
Fond encre — l'écran reste lisible de loin, sur un plan de travail. Kicker mono
« MODE CUISINE » + croix · nom de recette en Caprasimo · scaler de couverts ·
checklist d'ingrédients (cases rondes, quantités en terracotta-400) · progression en
segments · étape courante · bouton crème « Étape suivante ».

## 8. Ce qu'on ne fait pas

- Pas de drag-and-drop (peu fiable au toucher) — le planning se swipe par jour.
- Pas d'emoji, pas d'illustration décorative, pas de dégradé.
- Pas de gris froid, pas d'angle vif, pas de hex en dur dans un composant.
- Pas de deuxième bouton plein sur un écran.
- Pas de badge chiffré inutile : un compteur n'existe que s'il déclenche une action.
