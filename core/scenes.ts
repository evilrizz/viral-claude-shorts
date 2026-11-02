#!/usr/bin/env node
// Pipeline step 3: validates the visual plan (scenes.json) and stamps it with the real timings taken from the voice.
//   usage: node core/scenes.ts videos/<topic>
// The agent writes scenes.json pointing at WORDS (the # indices from the analysis), not at seconds:
// {
//   "style": "flat2d",                          // the style: a folder in styles/
//   "fps": 30, "format": "9:16",
//   "notes": "what the user asked for (colors, tone, specific scenes)",
//   "scenes": [
//     { "id": "hook", "from": 0,               // the scene starts when word #0 is said
//       "type": "question",                    // question | object | process | comparison | stat | map | asset | closing
//       "label": "CIENCIA EN LA COCINA",       // the little tag on top (short, upper case)
//       "title": "¿Por qué el pan se pone duro?",
//       "highlight": "duro",                   // word of the title that gets highlighted
//       "stat": { "value": "60 °C", "text": "y el almidón se suelta" },   // bottom card (optional)
//       "visual": "a surprised loaf of bread on a cutting board",        // what gets drawn (the style implements it)
//       "asset": "logo.png",                   // optional: a file from videos/<topic>/assets/
//       "keys": [ { "id": "crack", "at": 5 } ],  // moments inside the scene (when word #5 is said);
//                                                // none closer than 0.7 s to the end of the scene: the animation must finish
//       "transition": "cut" }                  // how this scene ENTERS: always "cut" for now
//   ]
// }
// This script adds t0/t1 (s) to every scene and t to every key, checks the contract and rewrites the file.
// Without a voice (no words.json, like the setup's test animation) there are no words to point at: scenes.json
// gives "duration" in seconds, every scene after the first its "t0" and every key its "t", also in seconds.
import fs from 'node:fs';
import path from 'node:path';
import type { Plan, Words } from './types.ts';

const dir = process.argv[2];
if (!dir) { console.error('usage: node core/scenes.ts videos/<topic>'); process.exit(2); }
const ROOT = path.resolve(dir), REPO = path.resolve(import.meta.dirname, '..');
const file = path.join(ROOT, 'scenes.json');
const E: Plan = JSON.parse(fs.readFileSync(file, 'utf8'));
const silent = !fs.existsSync(path.join(ROOT, 'words.json'));
const P: Words = silent ? { duration: E.duration, words: [] } : JSON.parse(fs.readFileSync(path.join(ROOT, 'words.json'), 'utf8'));
const TYPES = ['question', 'object', 'process', 'comparison', 'stat', 'map', 'asset', 'closing'];
// the cut lands IN THE PAUSE before the new idea (up to 0.25 s before its first word): the previous scene
// gets the whole pause to finish, and the new one arrives a hair before the word (it feels on time)
const BEFORE = 0.25, MARGIN = 0.7;   // MARGIN: no key closer than 0.7 s to the cut; one-key animations last ≤ 0.5 s
const W = P.words, err: string[] = [], warn: string[] = [];
const at = (i: number | undefined, what: string) => { if (i === undefined || !Number.isInteger(i) || i < 0 || i >= W.length) { err.push(`${what}: word #${i} does not exist (0–${W.length - 1})`); return 0; } return W[i].t0; };

if (!E.style || !fs.existsSync(path.join(REPO, 'styles', E.style, 'adapter.ts'))) err.push(`unknown style "${E.style}" (there is no styles/${E.style}/adapter.ts)`);
E.fps ??= 30; E.format ??= '9:16';
E.duration = P.duration;
if (silent && !(E.duration > 0)) err.push('there is no voice (words.json): scenes.json needs "duration" in seconds');
const S = E.scenes || [];
if (!S.length) err.push('there are no scenes');
S.forEach((s, k) => {
  if (!TYPES.includes(s.type)) err.push(`${s.id}: unknown type "${s.type}" (${TYPES.join(', ')})`);
  if (k === 0) s.t0 = 0;
  else if (silent) { if (typeof s.t0 !== 'number') err.push(`${s.id}: there is no voice, so the scene needs "t0" in seconds`); }
  else { const w = at(s.from, s.id), prev = s.from ? W[s.from - 1] : undefined; s.t0 = +Math.max(prev ? prev.t1 + 0.04 : 0, w - BEFORE).toFixed(3); }
  if (s.highlight && s.title && !s.title.toLowerCase().includes(s.highlight.toLowerCase())) err.push(`${s.id}: "highlight" (${s.highlight}) is not in the title`);
  if (s.title && s.title.length > 48) warn.push(`${s.id}: long title (${s.title.length} characters): ≤ 40 works better in 9:16`);
  if (s.asset && !fs.existsSync(path.join(ROOT, 'assets', s.asset))) err.push(`${s.id}: assets/${s.asset} does not exist`);
});
S.forEach((s, k) => {
  s.t1 = k < S.length - 1 ? S[k + 1].t0 : E.duration;
  if (s.t1 - s.t0 < 2.0) warn.push(`${s.id}: lasts ${(s.t1 - s.t0).toFixed(2)} s (under 2 s the animation can't be seen in full)`);
  if (k && s.t0 <= S[k - 1].t0) err.push(`${s.id}: starts before the previous scene (order of "from" or "t0")`);
  for (const c of s.keys || []) {
    if (!silent) c.t = +at(c.at, `${s.id}.${c.id}`).toFixed(3);
    else if (typeof c.t !== 'number') { err.push(`${s.id}.${c.id}: there is no voice, so the key needs "t" in seconds`); continue; }
    if (c.t < s.t0 - 1e-6 || c.t >= s.t1) err.push(`${s.id}.${c.id}: the key (${c.t}s) falls outside its scene (${s.t0}–${s.t1}s)`);
    else if (k < S.length - 1 && s.t1 - c.t < MARGIN) err.push(`${s.id}.${c.id}: the key lands ${(s.t1 - c.t).toFixed(2)} s before the cut: its animation would be left half done (leave ≥ ${MARGIN} s, or move it to the next scene)`);
  }
});
for (const w of warn) console.log('  warning', w);
if (err.length) { for (const e of err) console.log('  ERROR  ', e); process.exit(1); }
fs.writeFileSync(file, JSON.stringify(E, null, 1));
console.log(`scenes.json ok: ${S.length} scenes in ${E.duration.toFixed(2)} s, style ${E.style}`);
for (const s of S) console.log(`  ${s.t0.toFixed(2).padStart(6)}–${s.t1.toFixed(2).padEnd(6)} ${s.type.padEnd(11)} ${s.id.padEnd(12)} ${s.title || ''}${s.stat ? `  [${s.stat.value}]` : ''}`);
