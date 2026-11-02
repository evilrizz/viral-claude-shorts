#!/usr/bin/env node
// Pipeline step 2: timed words -> phrases, pauses and numbers, so the visual plan sticks to the voice.
//   usage: node core/analyze.ts videos/<topic>
//   reads  videos/<topic>/words.json
//   writes videos/<topic>/analysis.json and prints a readable table (the one the agent uses to write scenes.json)
// Phrases: split at a final punctuation mark or at a pause >= 0.28 s. Every word carries its global index (#),
// which is how scenes.json points at it ("at": 12 = when word 12 starts).
import fs from 'node:fs';
import path from 'node:path';
import type { Words } from './types.ts';

const dir = process.argv[2];
if (!dir) { console.error('usage: node core/analyze.ts videos/<topic>'); process.exit(2); }
const ROOT = path.resolve(dir);
const P: Words = JSON.parse(fs.readFileSync(path.join(ROOT, 'words.json'), 'utf8'));
const W = P.words.map((p, i) => ({ ...p, i }));

const NUM = /^\d|^(cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|cien|ciento|doscientos|trescientos|cuatrocientos|quinientos|seiscientos|mil|millón|millones|mitad|doble|triple|zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|million|billion|half|double|twice)\b/i;
type Phrase = { n: number; t0: number; t1: number; from: number; to: number; text: string; question: boolean };
const phrases: Phrase[] = [], pauses: { t0: number; t1: number; dur: number; after: number }[] = [];
let cur: typeof W = [];
W.forEach((w, k) => {
  cur.push(w);
  const next = W[k + 1], gap = next ? next.t0 - w.t1 : Infinity;
  if (next && gap >= 0.28) pauses.push({ t0: w.t1, t1: next.t0, dur: +gap.toFixed(3), after: w.i });
  if (!next || /[.?!…]$/.test(w.w) || gap >= 0.28) {
    phrases.push({ n: phrases.length + 1, t0: cur[0].t0, t1: w.t1, from: cur[0].i, to: w.i, text: cur.map((x) => x.w).join(' '),
      question: /[?¿]/.test(cur.map((x) => x.w).join(' ')) });
    cur = [];
  }
});
const numbers = W.filter((w) => NUM.test(w.w.replace(/^[¿¡"(]+/, ''))).map((w) => ({ i: w.i, w: w.w, t0: w.t0 }));
const out = { duration: P.duration, phrases, pauses, numbers, words: W.length };
fs.writeFileSync(path.join(ROOT, 'analysis.json'), JSON.stringify(out, null, 1));

console.log(`${path.basename(ROOT)}: ${P.duration.toFixed(2)} s, ${W.length} words, ${phrases.length} phrases, ${pauses.length} pauses, ${numbers.length} numbers`);
for (const f of phrases) {
  console.log(`\n[${f.n}] ${f.t0.toFixed(2)}–${f.t1.toFixed(2)}s${f.question ? '  (question)' : ''}`);
  console.log('   ' + W.slice(f.from, f.to + 1).map((w) => `${w.w}#${w.i}@${w.t0.toFixed(2)}`).join(' '));
}
if (numbers.length) console.log('\nnumbers: ' + numbers.map((c) => `${c.w}#${c.i}@${c.t0.toFixed(2)}`).join(', '));
console.log(`\n-> ${path.join(dir, 'analysis.json')}`);
