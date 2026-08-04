# CADENCE

Entendre une partie d'échecs. L'échiquier n'est pas une grille de fréquences, c'est un
treillis de degrés de gamme — et chaque pièce est jouée par **son geste**, pas par un timbre.

Une page, aucune dépendance, aucune ressource externe. Synthèse Web Audio, moteur d'échecs
complet (génération de coups légaux, analyse SAN, détection de mat et de pat).

**→ https://proruby.github.io/music-chess/**

---

## L'idée

La première tentative associait un instrument à chaque pièce et une fréquence à chaque case,
avec des écarts de tierce entre cases voisines pour limiter la casse. Le résultat était
désagréable, pour trois raisons indépendantes :

1. **Des fréquences absolues.** Les tierces créaient de la consonance *locale*, mais deux coups
   séparés de dix demi-coups touchaient des cases éloignées sans aucune raison d'appartenir au
   même accord.
2. **Aucun contexte harmonique.** Une note n'est belle que par rapport à un fond. Il n'y avait
   pas de fond.
3. **Ni pulsation ni fin.** Une suite d'événements n'est pas de la musique. Il manquait un
   rythme, et surtout une résolution.

Un quatrième point, plus discret : une pièce = un timbre, c'est du gaspillage. Ce qui distingue
un cavalier d'un fou, ce n'est pas sa couleur sonore, c'est sa façon de se déplacer.

## Le treillis

Chaque case porte un **degré de gamme**, pas une fréquence :

```
degré = colonne + 2 × rangée        (a1 = 0, h8 = 21, soit trois octaves)
```

La gamme sous-jacente, elle, évolue avec la partie. Conséquence : toute note est dans la gamme
courante, donc juste, quelle que soit la distance entre deux coups. Le problème de dissonance
disparaît par construction.

Et les intervalles tombent gratuitement de la géométrie :

| Geste | Degrés parcourus | Ce qu'on entend |
|---|---|---|
| Tour, horizontale | 0→1→2→3→4→5→6 | une gamme qui court |
| Tour, verticale | 0→2→4→6→8 | des tierces empilées |
| Fou, une diagonale | 2→5→8→11→14 | des quartes |
| Fou, l'autre diagonale | 6→7→8→9→10 | des degrés conjoints |
| Cavalier | 1→5→6 | un saut, puis on se pose |
| Cavalier « plat » | 5→7→5 | une broderie |

Les deux diagonales d'un fou ne sonnent pas pareil. Ce n'était pas prévu — c'est tombé tout
seul de la formule. Un fou de cases blanches et un fou de cases noires ont deux voix distinctes.

Le cas du cavalier « plat » mérite un mot : certains sauts arrivent au même degré que leur
départ (`+2−2 = 0`), ce qui donnerait un geste muet. Le passage par le coin du L rattrape ça et
produit une broderie — reconnaissable entre toutes.

## Ce qui donne sa forme à la pièce

**Le mode suit le matériel.** Les sept modes rangés du plus clair au plus sombre — lydien,
ionien, mixolydien, dorien, éolien, phrygien, locrien — forment un axe continu, et l'avantage
matériel y place le curseur. La partie de l'Opéra traverse dorien → mixolydien → éolien →
phrygien → locrien.

**Les prises modulent.** Prendre une pièce de trois points ou plus déplace la tonique d'une
quinte : vers les dièses pour les Blancs, vers les bémols pour les Noirs. Les échanges
deviennent une vraie progression harmonique, à l'échelle de la partie.

**La tension ouvre l'accord.** On compte les pièces attaquées et celles qui pendent ; le
bourdon ajoute la note qui signe le mode (le 4 augmenté du lydien, la 2 mineure du phrygien)
proportionnellement.

**Le mat est une cadence.** C'était le manque le plus grave de la première version : une partie
a une fin dramatique, la musique n'en avait pas. Le mat déclenche une cadence parfaite dans la
tonique accumulée, précédée d'un silence. Le pat s'éteint sur une quinte à vide, sans tierce —
rien n'est tranché.

## Calibrage

Deux réglages ont demandé de mesurer plutôt que de deviner, sur un corpus de cinq parties :

- **La tension saturait** à 1.00 dès le 24ᵉ demi-coup — un compteur mort sur la moitié de la
  partie. Le coupable était un `Math.min(1, …)`. Un genou exponentiel `1 − e⁻ˣ` rend toute la
  plage : médiane 0.21, maximum 0.83, jamais collé au plafond.
- **Le mode restait en dorien** 51 % du temps avec la pente initiale. Mesurée sur le corpus,
  une pente de 1.8 point de matériel par mode donne une vraie traversée.

## Utilisation

Ouvrir la page. Aucune installation.

- **Écouter** rejoue la partie sélectionnée ; `espace` met en pause, `←`/`→` avancent d'un coup.
- **Jouer moi-même** ouvre un échiquier libre — les coups sont sonifiés au fil du jeu.
- **Coller un PGN** accepte n'importe quelle partie en notation algébrique standard.
- Les quatre bascules isolent les couches : gestes, bourdon, pouls, menace.

## Tests

```bash
node test/engine.test.js
```

Le test **extrait le moteur depuis `index.html`** au lieu d'en garder une copie : il vérifie
donc le code réellement déployé. Il couvre `perft` jusqu'à la profondeur 4 (20 / 400 / 8902 /
197281, ce qui attrape toute erreur de roque, prise en passant, promotion ou clouage), les cinq
parties de référence jusqu'au mat, l'aller-retour SAN sur 214 coups, et les bornes des valeurs
que la synthèse consomme.

## Pistes non implémentées

**La promotion comme transformation thématique.** Le pion a un motif — une note brève et sèche.
La dame a un thème — un balayage large. Une promotion devrait jouer le motif du pion *puis le
déployer* en thème de dame. C'est du Wagner, et les échecs l'offrent gratuitement : aucun autre
jeu n'a un objet humble qui devient littéralement l'objet puissant. La version actuelle ne fait
que l'esquisser.

**Le temps de réflexion comme rythme.** Si le PGN contient les pendules, une longue réflexion
devient un point d'orgue et une séquence de blitz une strette. C'est la respiration dramatique
réelle d'une partie, et il n'y a rien à inventer : la donnée est déjà là.

**La structure de pions comme basse.** Les pions bougent lentement et dessinent le squelette de
la position — parfaits pour un ostinato, un motif par colonne, qui ne change qu'aux ruptures.
Ça donnerait une forme à l'échelle de la minute, pas du coup.

**Deux tonalités qui se disputent.** Blancs en Do, Noirs à distance de triton ; celui qui a
l'initiative attire le centre tonal vers lui. La lutte deviendrait littéralement audible.

**L'entendre à l'aveugle.** Si la sonification est assez lisible, on devrait pouvoir suivre une
partie sans regarder, et sentir le danger monter avant de le voir. Ce serait le vrai test : un
outil d'entraînement, pas seulement une curiosité.

## Déploiement

Le workflow `.github/workflows/pages.yml` lance les tests puis publie la page sur GitHub Pages
à chaque poussée sur `main`.

Prérequis, à faire une seule fois : **Settings → Pages → Source : « GitHub Actions »**. Le jeton
d'un workflow ne peut pas créer le site Pages lui-même ; cette activation initiale est manuelle.
