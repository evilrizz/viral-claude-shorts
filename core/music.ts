#!/usr/bin/env node
// Background music + sound effects, synthesized in code and locked to the scenes (no third-party audio files).
//   usage: node core/music.ts videos/<topic> [--mood warm|technical|airy|cinematic] [--bpm 100]
//   reads  scenes.json (with timings: run core/scenes.ts first)
//   writes videos/<topic>/music.wav (48 kHz stereo): a chord pad, a soft pulse, a "swish" on every
//   scene change and a low hit on "stat" scenes (the number is the strong moment).
// The default mood comes from the style: papercut=warm, isometric=technical, flat2d=airy, 3d=cinematic.
// If you bring your own music, save it as videos/<topic>/own-music.wav and this step is skipped.
import fs from 'node:fs';
import path from 'node:path';
import type { Plan } from './types.ts';

const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv.splice(i, 2)[1] : d; };
const DIR = argv[0];
if (!DIR) { console.error('usage: node core/music.ts videos/<topic> [--mood warm]'); process.exit(2); }
const ROOT = path.resolve(DIR);
const E: Plan = JSON.parse(fs.readFileSync(path.join(ROOT, 'scenes.json'), 'utf8'));
if (E.duration == null || E.scenes.some((s) => s.t0 == null)) { console.error('scenes.json has no timings: run node core/scenes.ts first'); process.exit(1); }
const MOODS: Record<string, string> = { papercut: 'warm', isometric: 'technical', flat2d: 'airy', '3d': 'cinematic' };
const MOOD = opt('--mood', MOODS[E.style] || 'warm');
const BPMS: Record<string, number> = { warm: 96, technical: 110, airy: 90, cinematic: 84 };
const BPM = Number(opt('--bpm', String(BPMS[MOOD] ?? 96)));
const SR = 48000, DUR = E.duration, N = Math.ceil(DUR * SR);
const L = new Float32Array(N), R = new Float32Array(N);

// deterministic: the same plan always gives the same audio
let seed = 1234567;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const NOTE: Record<string, number> = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
const nz = (n: string) => { const m = /^([A-G])(s|b)?(\d)$/.exec(n)!; const st = NOTE[m[1]] + (m[2] === 's' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * 2 ** (st / 12 + (Number(m[3]) - 4)); };
const PROGS: Record<string, string[][]> = {
  warm: [['D3', 'A3', 'Fs4', 'D4'], ['B2', 'Fs3', 'D4', 'A4'], ['G2', 'D3', 'B3', 'D4'], ['A2', 'E3', 'Cs4', 'A3']],
  technical: [['A2', 'E3', 'B3', 'C4'], ['F2', 'C3', 'G3', 'A3'], ['C3', 'G3', 'D4', 'E4'], ['G2', 'D3', 'A3', 'B3']],
  airy: [['C3', 'G3', 'E4', 'B4'], ['A2', 'E3', 'C4', 'G4'], ['F2', 'C3', 'A3', 'E4'], ['G2', 'D3', 'B3', 'Fs4']],
  cinematic: [['D2', 'A2', 'F3', 'A3'], ['Bb1', 'F2', 'D3', 'F3'], ['F2', 'C3', 'A3', 'C4'], ['C2', 'G2', 'E3', 'G3']],
};
const PROG = PROGS[MOOD] ?? PROGS.warm;
const TIMBRES: Record<string, string> = { warm: 'tri', technical: 'saw', airy: 'sine', cinematic: 'saw' };
const TIMBRE = TIMBRES[MOOD] ?? 'sine';
const osc = (type: string, ph: number) => type === 'sine' ? Math.sin(ph) : type === 'tri' ? 2 / Math.PI * Math.asin(Math.sin(ph)) : 2 * ((ph / (2 * Math.PI)) % 1) - 1;
function add(t0: number, dur: number, fn: (u: number) => number, vol: number, pan = 0) {   // fn(local t) -> sample; the caller applies the envelope
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = vol * Math.cos((pan + 1) * Math.PI / 4), gr = vol * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = a; i < b; i++) { const v = fn((i - a) / SR); L[i] += v * gl; R[i] += v * gr; }
}
// pad: one chord per bar, slow attack and release, filtered (one pole)
const BAR = 4 * 60 / BPM;
for (let k = 0, t = 0; t < DUR; k++, t += BAR) {
  const ch = PROG[k % PROG.length];
  ch.forEach((n, j) => {
    const f = nz(n), det = 1 + (j % 2 ? 0.002 : -0.002); let y = 0;
    add(t, BAR + 0.6, (u) => { const env = Math.min(1, u / 0.5) * Math.min(1, (BAR + 0.6 - u) / 0.6); const x = osc(TIMBRE, 2 * Math.PI * f * det * u); y += 0.06 * (x - y); return env * y; }, 0.16, j % 2 ? 0.35 : -0.35);
  });
}
// pulse: a short chord note every eighth, soft (goes quiet 1.2 s before every "stat": the silence before the hit)
const E8 = 30 / BPM, stats = E.scenes.filter((s) => s.type === 'stat').map((s) => s.t0);
for (let k = 0, t = E8; t < DUR - 0.5; k++, t += E8) {
  if (stats.some((d) => t > d - 1.2 && t < d)) continue;
  const ch = PROG[Math.floor(t / BAR) % PROG.length], f = nz(ch[(k * 3) % ch.length]) * 2;
  add(t, 0.35, (u) => Math.sin(2 * Math.PI * f * u) * Math.exp(-u * 11), k % 2 ? 0.05 : 0.075, k % 4 < 2 ? 0.25 : -0.25);
}
// per-scene effects: a filtered-noise swish on entry, a low hit + bell on stats
for (const s of E.scenes.slice(1)) {
  let y = 0; const d = 0.32;
  add(s.t0 - d * 0.7, d, (u) => { y += 0.18 * ((rnd() * 2 - 1) - y); return y * Math.sin(Math.PI * u / d) ** 2; }, 0.28, 0);
}
for (const t of stats) {
  add(t, 0.9, (u) => Math.sin(2 * Math.PI * (55 + 50 * Math.exp(-u * 18)) * u) * Math.exp(-u * 4.5), 0.9, 0);
  [nz('A5'), nz('E6')].forEach((f, j) => add(t + j * 0.06, 1.4, (u) => Math.sin(2 * Math.PI * f * u) * Math.exp(-u * 3), 0.07, j ? 0.3 : -0.3));
}
// outro: final fade
for (let i = Math.max(0, N - SR); i < N; i++) { const g = (N - i) / SR; L[i] *= g; R[i] *= g; }
// to 16-bit WAV (with a soft limiter)
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { buf.writeInt16LE(Math.round(Math.tanh(L[i]) * 32000), 44 + i * 4); buf.writeInt16LE(Math.round(Math.tanh(R[i]) * 32000), 46 + i * 4); }
fs.writeFileSync(path.join(ROOT, 'music.wav'), buf);
console.log(`music.wav: ${DUR.toFixed(2)} s, mood ${MOOD}, ${BPM} BPM, ${E.scenes.length - 1} swishes, ${stats.length} stat hit(s)`);
