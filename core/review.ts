#!/usr/bin/env node
// Pipeline step 6: MEASURED review of the final video (what the eye misses).
//   usage: node core/review.ts videos/<topic>
//   1. format: 1080x1920, length = the audio's (±0.15 s)
//   2. loudness: -14 LUFS integrated (±1), true peak <= -1 dBTP
//   3. cuts: on every scene change the picture really changes (pixel difference well above the usual)
//   4. dead stretches: more than 3 s with almost no motion
//   5. text: cut off by the edge, overlapping or under the phone's interface (if the style can measure it)
//   -> videos/<topic>/report.md and videos/<topic>/review/sheet.jpg (one frame per second, to look at it at phone size)
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { load } from './style.ts';

if (!process.argv[2]) { console.error('usage: node core/review.ts videos/<topic>'); process.exit(2); }
const { v, E, A } = await load(process.argv[2]);
const VID = path.join(v, 'final.mp4'), REV = path.join(v, 'review');
fs.mkdirSync(REV, { recursive: true });
const probe = (args: string[], f: string) => spawnSync('ffprobe', ['-v', 'error', ...args, '-of', 'csv=p=0', f]).stdout.toString().trim();
const rows: [string, string, string][] = [], check = (n: string, pass: boolean | null, det: string) => { rows.push([n, pass === null ? 'WARN' : pass ? 'OK' : 'FAIL', det]); };

// 1. format and length
const [w, h] = probe(['-select_streams', 'v:0', '-show_entries', 'stream=width,height'], VID).split(',').map(Number);
const dur = Number(probe(['-show_entries', 'format=duration'], VID));
check('format', w === 1080 && h === 1920, `${w}x${h}`);
check('length', Math.abs(dur - E.duration) <= 0.15, `${dur.toFixed(2)} s (audio ${E.duration.toFixed(2)} s)`);
// 2. loudness
const lo = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', VID, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { maxBuffer: 1 << 26 }).stderr.toString();
const last = (re: RegExp) => Number((lo.match(re) || []).pop()?.match(/-?[\d.]+/)?.[0]);
const I = last(/I:\s+(-?[\d.]+) LUFS/g), TP = last(/Peak:\s+(-?[\d.]+) dBFS/g);
check('loudness', Math.abs(I + 14) <= 1, `${I} LUFS (target -14)`);
check('true peak', TP <= -0.9, `${TP} dBTP (target <= -1)`);
// 3 and 4. cuts and dead stretches (small grayscale frames)
const fps = E.fps, SW = 72, SH = 128, PX = SW * SH;
const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', VID, '-vf', `scale=${SW}:${SH},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 }).stdout;
const n = raw.length / PX, d = [0];
for (let f = 1; f < n; f++) { let s = 0; for (let i = 0; i < PX; i++) s += Math.abs(raw[f * PX + i] - raw[(f - 1) * PX + i]); d.push(s / PX); }
const med = [...d].sort((a, b) => a - b)[Math.floor(n / 2)] || 0.01;
const bad: string[] = [];
for (const s of E.scenes.slice(1)) {
  const f0 = Math.round(s.t0 * fps), win = d.slice(Math.max(1, f0 - 6), Math.min(n, f0 + 7)), pk = Math.max(...win);
  if (pk < Math.max(4, med * 4)) bad.push(`${s.id} @${s.t0}s (peak ${pk.toFixed(1)})`);
}
check('visible scene changes', !bad.length, bad.length ? bad.join('; ') : `${E.scenes.length - 1} changes, all visible`);
const still: string[] = []; let q0 = -1;
for (let f = 1; f <= n; f++) { const st = f < n && d[f] < 0.15; if (st && q0 < 0) q0 = f; if (!st && q0 >= 0) { if ((f - q0) / fps > 3) still.push(`${(q0 / fps).toFixed(1)}–${(f / fps).toFixed(1)} s`); q0 = -1; } }
check('no dead stretches (> 3 s still)', still.length ? null : true, still.length ? still.join(', ') : 'none');
// 5. text
if (A.texts) { const r = await A.texts(v); check('text (cut off / overlapping / safe zone)', r, r === null ? 'could not be measured' : 'details above in the console'); }
else check('text (cut off / overlapping / safe zone)', null, 'this style does not measure it yet: check the contact sheet');
// contact sheet: 1 frame per second
const cols = 6, sheetRows = Math.ceil(dur / cols);
spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', VID, '-vf', `fps=1,scale=180:320,tile=${cols}x${sheetRows}`, '-frames:v', '1', '-q:v', '3', path.join(REV, 'sheet.jpg')]);

const fails = rows.filter((f) => f[1] === 'FAIL').length;
const rep = [`# Report: ${path.basename(v)} (${E.style})`, '', `Result: **${fails ? `${fails} failure(s)` : 'PASS'}**`, '',
  '| check | status | detail |', '|---|---|---|', ...rows.map((f) => `| ${f.join(' | ')} |`), '',
  '![contact sheet, 1 frame per second](review/sheet.jpg)', '',
  'Not verified: that it sounds good (the review measures loudness and timing, it does not listen).'];
fs.writeFileSync(path.join(v, 'report.md'), rep.join('\n') + '\n');
console.log('\nREVIEW');
for (const f of rows) console.log(`  ${f[1].padEnd(6)} ${f[0]}: ${f[2]}`);
console.log(`-> ${path.join(process.argv[2], 'report.md')}`);
process.exitCode = fails ? 1 : 0;
