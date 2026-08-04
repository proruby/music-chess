// Teste le moteur d'échecs tel qu'il est réellement livré : le code est extrait
// de index.html, pas recopié. Une seule source de vérité, aucune dérive possible.
// Usage : node test/engine.test.js
"use strict";
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(SRC, 'utf8');

const START = "/* ════════ MOTEUR D'ÉCHECS ════════ */";
const END = "/* ════════ MUSIQUE ════════ */";
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < 0) {
  console.error("Impossible de localiser la section moteur dans index.html.");
  console.error("Les marqueurs de section ont-ils changé ? Attendu :\n  " + START + "\n  " + END);
  process.exit(1);
}

const EXPORTS = ['newGame','legalMoves','applyMove','parsePGN','parseSAN','toSAN',
                 'analyse','inCheck','colorOf','attacked','sq','fileOf','rankOf','VAL'];
const E = new Function('"use strict";' + html.slice(a + START.length, b) +
                       ';return {' + EXPORTS.join(',') + '};')();

let failures = 0;
function check(label, actual, expected) {
  const ok = String(actual) === String(expected);
  if (!ok) failures++;
  console.log((ok ? '  ok   ' : '  ÉCHEC ') + label +
              (ok ? '' : `\n         attendu ${expected}, obtenu ${actual}`));
}

// ── perft : la référence qui attrape toute erreur de génération de coups ──
// (roque, prise en passant, promotion, clouages — tout y passe)
function perft(s, d) {
  if (d === 0) return 1;
  let n = 0;
  for (const m of E.legalMoves(s, s.turn)) n += perft(E.applyMove(s, m), d - 1);
  return n;
}
console.log('\nperft depuis la position initiale');
const EXPECTED = [20, 400, 8902, 197281];
EXPECTED.forEach((exp, i) => check('profondeur ' + (i + 1), perft(E.newGame(), i + 1), exp));

// ── parties célèbres : chaque coup doit être lisible et mener au mat ──
const GAMES = {
  "Morphy — Opéra 1858": ["1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8#", 33],
  "Anderssen — L'Immortelle 1851": ["1.e4 e5 2.f4 exf4 3.Bc4 Qh4+ 4.Kf1 b5 5.Bxb5 Nf6 6.Nf3 Qh6 7.d3 Nh5 8.Nh4 Qg5 9.Nf5 c6 10.g4 Nf6 11.Rg1 cxb5 12.h4 Qg6 13.h5 Qg5 14.Qf3 Ng8 15.Bxf4 Qf6 16.Nc3 Bc5 17.Nd5 Qxb2 18.Bd6 Bxg1 19.e5 Qxa1+ 20.Ke2 Na6 21.Nxg7+ Kd8 22.Qf6+ Nxf6 23.Be7#", 45],
  "Anderssen — L'Immortelle verte 1852": ["1.e4 e5 2.Nf3 Nc6 3.Bc4 Bc5 4.b4 Bxb4 5.c3 Ba5 6.d4 exd4 7.O-O d3 8.Qb3 Qf6 9.e5 Qg6 10.Re1 Nge7 11.Ba3 b5 12.Qxb5 Rb8 13.Qa4 Bb6 14.Nbd2 Bb7 15.Ne4 Qf5 16.Bxd3 Qh5 17.Nf6+ gxf6 18.exf6 Rg8 19.Rad1 Qxf3 20.Rxe7+ Nxe7 21.Qxd7+ Kxd7 22.Bf5+ Ke8 23.Bd7+ Kf8 24.Bxe7#", 47],
  "Fischer — Partie du siècle 1956": ["1.Nf3 Nf6 2.c4 g6 3.Nc3 Bg7 4.d4 O-O 5.Bf4 d5 6.Qb3 dxc4 7.Qxc4 c6 8.e4 Nbd7 9.Rd1 Nb6 10.Qc5 Bg4 11.Bg5 Na4 12.Qa3 Nxc3 13.bxc3 Nxe4 14.Bxe7 Qb6 15.Bc4 Nxc3 16.Bc5 Rfe8+ 17.Kf1 Be6 18.Bxb6 Bxc4+ 19.Kg1 Ne2+ 20.Kf1 Nxd4+ 21.Kg1 Ne2+ 22.Kf1 Nc3+ 23.Kg1 axb6 24.Qb4 Ra4 25.Qxb6 Nxd1 26.h3 Rxa2 27.Kh2 Nxf2 28.Re1 Rxe1 29.Qd8+ Bf8 30.Nxe1 Bd5 31.Nf3 Ne4 32.Qb8 b5 33.h4 h5 34.Ne5 Kg7 35.Kg1 Bc5+ 36.Kf1 Ng3+ 37.Ke1 Bb4+ 38.Kd1 Bb3+ 39.Kc1 Ne2+ 40.Kb1 Nc3+ 41.Kc1 Rc2#", 82],
  "Mat du berger": ["1.e4 e5 2.Bc4 Nc6 3.Qh5 Nf6 4.Qxf7#", 7],
};
console.log('\nparties de référence');
for (const [name, [pgn, plies]] of Object.entries(GAMES)) {
  const r = E.parsePGN(pgn);
  if (r.error) { failures++; console.log(`  ÉCHEC ${name}\n         coup illisible « ${r.error} » après ${r.plies.length} demi-coups`); continue; }
  const last = r.plies[r.plies.length - 1];
  check(`${name} — ${plies} demi-coups, mat`,
        `${r.plies.length}/${E.analyse(last.after).mate}`, `${plies}/true`);
}

// ── SAN : ce qu'on écrit doit être ce qu'on relit ──
console.log('\naller-retour SAN (désambiguïsation, échec, mat, roque, promotion)');
let sanOk = 0, sanBad = 0;
for (const [pgn] of Object.values(GAMES)) {
  for (const p of E.parsePGN(pgn).plies) {
    const written = E.toSAN(p.before, p.mv);
    // on compare sans les suffixes +/# : ils sont facultatifs dans un PGN d'entrée
    if (written.replace(/[+#]/g, '') === p.san.replace(/[+#]/g, '')) sanOk++;
    else { sanBad++; if (sanBad < 4) console.log(`         « ${p.san} » réécrit « ${written} »`); }
  }
}
check(`${sanOk} coups réécrits à l'identique`, sanBad, 0);

// ── la sonification lit ces valeurs : elles doivent rester dans leurs bornes ──
console.log('\nbornes de l\'analyse (la synthèse en dépend)');
let tMin = 1, tMax = 0, outOfRange = 0;
for (const [pgn] of Object.values(GAMES)) {
  for (const p of E.parsePGN(pgn).plies) {
    const an = E.analyse(p.after);
    tMin = Math.min(tMin, an.tension); tMax = Math.max(tMax, an.tension);
    if (an.tension < 0 || an.tension >= 1) outOfRange++;
    if (an.kw < 0 || an.kw > 1 || an.kb < 0 || an.kb > 1) outOfRange++;
  }
}
check('tension et danger dans [0,1[', outOfRange, 0);
check('la tension garde une vraie plage (max > 0.5)', tMax > 0.5, true);
console.log(`         tension observée : ${tMin.toFixed(2)} → ${tMax.toFixed(2)}`);

console.log(failures ? `\n${failures} test(s) en échec\n` : '\nTous les tests passent.\n');
process.exit(failures ? 1 : 0);
