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
- **Coller un PGN** accepte n'importe quelle partie en notation algébrique standard,
  annotations de pendule `[%clk]` / `[%emt]` comprises (exports lichess et chess.com).
- Les quatre bascules isolent les couches : gestes, bourdon, pouls, menace.
- Trois couches optionnelles s'ajoutent : basse de pions, pendules, duo tonal.

## Tests

```bash
node test/engine.test.js
```

Le test **extrait le moteur depuis `index.html`** au lieu d'en garder une copie : il vérifie
donc le code réellement déployé. Il couvre `perft` jusqu'à la profondeur 4 (20 / 400 / 8902 /
197281, ce qui attrape toute erreur de roque, prise en passant, promotion ou clouage), les cinq
parties de référence jusqu'au mat, l'aller-retour SAN sur 214 coups, et les bornes des valeurs
que la synthèse consomme.

## Mode aveugle

Peut-on *reconstituer* les coups à l'oreille, et pas seulement ressentir la partie ? Un auditeur
qui suit la position ne choisit pas parmi 4096 coups mais parmi 32 en moyenne — les seuls coups
légaux. En comptant, sur les 214 coups du corpus, combien de coups légaux produisent le même
signal que celui joué :

| Ce que l'auditeur perçoit | Coups identifiés sans ambiguïté |
|---|---|
| Signal complet (hauteurs, pan exact, timbre) | 100 % |
| Sans panoramique du tout | 97,2 % |
| Tour et dame confondues | 98,6 % |
| Hauteurs seules, ni pan ni timbre | 93,0 % |
| Départ et arrivée saisis, milieu du trait perdu | 91,6 % |
| Seule l'arrivée saisie | 76,2 % |

Trois conclusions. **Le panoramique est un luxe** : deux cases de même degré sont toujours
écartées d'au moins deux colonnes, jamais adjacentes — donc aucune localisation fine n'est
requise. **Le timbre aussi** : confondre tour et dame ne coûte que 1,4 point, la géométrie du
trajet les sépare déjà. **C'est le trajet qui porte l'information**, pas la case d'arrivée.

Mais tout repose sur l'identification du degré exact. Avec une tolérance de ±1 degré (une
seconde), on tombe à 75,7 % ; à ±2 (une tierce), 62,1 %. C'est l'hypothèse la plus fragile du
modèle, et c'est elle qui décide.

Le bouton **Mode aveugle** corrige les quatre points de fuite mesurés :

| Défaut | Mesure | Correction |
|---|---|---|
| Débit trop rapide | 14–18 notes/s (transcription fiable : 5–8) | ramené à ~6 notes/s |
| Départ atténué | note de grâce à 35 % ; 76 % contre 92 % | départ et arrivée à plein niveau |
| Tonique mobile | 26 modulations sur 214 demi-coups | cadre gelé en do ionien |
| Camp non encodé | seule l'alternance le dit | marqueur bruité par camp |

Le marqueur (coup sourd pour les Blancs, clic aigu pour les Noirs) n'aide pas à identifier un
coup — on sait déjà à qui c'est. Il sert à se rattraper après un décrochage, ce que le cadre
mobile rendait impossible.

L'échange est assumé : en mode aveugle l'harmonie ne raconte plus rien, elle sert de règle
graduée. Réserve d'honnêteté : les pourcentages sont exacts, mais les seuils perceptifs auxquels
ils se comparent sont des ordres de grandeur issus de la littérature, pas des mesures faites
ici. Seul un test avec de vrais auditeurs trancherait.

## Couches optionnelles

**La promotion comme métamorphose** — toujours active. C'est la seule transformation que le jeu
offre gratuitement : un objet humble devient l'objet puissant. Le motif du pion est énoncé tel
qu'il a toujours sonné, puis augmenté deux fois : l'intervalle passe de 3 à 7 puis 10 demi-tons,
la durée de 0,24 s à 1,4 s, et le timbre devient celui de la pièce promue. Sous-promotion
comprise.

**La basse de pions** — un pas par colonne, la hauteur donnée par le pion le plus avancé (blancs
dans le grave, noirs plus haut et plus discrets). Une colonne ouverte devient un silence dans
l'ostinato ; un pion poussé fait monter sa note et finit par sortir de la basse — un pion passé
sur la septième chante au-dessus du reste. C'est la seule couche qui donne une forme à l'échelle
de la minute plutôt que du coup.

**Les pendules** — lues dans les annotations `%clk` ou `%emt`. Chaque réflexion est rapportée à
la médiane de la partie et non à une valeur absolue, si bien qu'une blitz et une classique
respirent pareil à leur propre échelle. Une longue réflexion devient un point d'orgue, et le
silence *précède* le coup : c'est le joueur qu'on entend penser. L'option se désactive d'elle-même
sur une partie sans pendules.

**Le duo tonal** — les Blancs en do, les Noirs à distance de triton. Chaque camp joue dans sa
propre tonalité et le bourdon penche vers celui qui mène : le camp en difficulté sonne
littéralement faux, sur un fond qui n'est plus le sien. La tonalité rivale s'entend d'autant plus
fort que la partie reste serrée — à matériel égal on entend les deux, c'est-à-dire un triton. La
cadence finale tranche dans la tonalité du vainqueur.

Le duo tonal et le mode aveugle s'excluent : l'un fait diverger le cadre tonal, l'autre le gèle
pour qu'on puisse décoder. L'interface applique l'exclusion.

## Ce qui reste

- **Les pendules ignorent l'incrément.** Le temps de réflexion est déduit de la baisse de pendule
  entre deux coups d'un même camp ; sur une cadence avec incrément, cette différence sous-estime
  la réflexion de la valeur de l'incrément, que le PGN ne contient pas toujours. Les annotations
  `%emt` sont exactes.
- **Le jeu libre ne se chronomètre pas.** Rien n'empêcherait de mesurer le temps de décision du
  joueur et de le réinjecter comme rythme en direct.
- **Le duo tonal frotte avec l'axe des modes.** Le mode continue de suivre le matériel pendant que
  les toniques divergent : deux mécaniques disent la même chose par deux moyens différents.
- **Rien n'a été validé à l'oreille.** Seuils, calibrages et pourcentages de décodabilité sont
  mesurés ou raisonnés, jamais éprouvés sur des auditeurs.

## Déploiement

Le workflow `.github/workflows/pages.yml` lance les tests puis publie la page sur GitHub Pages
à chaque poussée sur `main`.

Prérequis, à faire une seule fois : **Settings → Pages → Source : « GitHub Actions »**. Le jeton
d'un workflow ne peut pas créer le site Pages lui-même ; cette activation initiale est manuelle.
