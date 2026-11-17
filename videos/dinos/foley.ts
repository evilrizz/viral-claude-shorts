#!/usr/bin/env node
// Cartoon foley for "dinos": a layer of sound effects with their own level, on top of the synthesized music.
//   usage: node videos/dinos/foley.ts            (run it after any change to scenes.json, then render)
//   1) runs core/music.ts -> music.wav (the score with its own sfx), 2) synthesizes foley.wav from the cues below,
//   3) writes own-music.wav = music + foley (+FOLEY_DB). mix.ts puts it 16 dB under the voice, so the foley lands ~4 dB under it (and ducks while someone talks).
//   Deterministic: no clocks, a seeded noise. Explosions are soft (low-passed, short, no clipping).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const V = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(V, '../..');
const r = spawnSync(process.execPath, [path.join(ROOT, 'core', 'music.ts'), V], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

type Sc = { id: string; t0: number; t1: number; keys?: { id: string; t: number }[]; marks?: { k: string; dt?: number; z?: number }[] };
const P: { duration: number; scenes: Sc[] } = JSON.parse(fs.readFileSync(path.join(V, 'scenes.json'), 'utf8'));
const sc = (id: string) => { const s = P.scenes.find((x) => x.id === id); if (!s) throw new Error('no scene ' + id); return s; };
const K = (id: string, k: string) => { const c = sc(id).keys?.find((x) => x.id === k); if (!c) throw new Error(`no key ${id}.${k}`); return c.t; };
const T0 = (id: string) => sc(id).t0, T1 = (id: string) => sc(id).t1;

const SR = 48000, N = Math.ceil(P.duration * SR), TAU = 2 * Math.PI;
const L = new Float32Array(N), R = new Float32Array(N);
let seed = 7654321; const noise = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
function add(t0: number, dur: number, fn: (u: number) => number, vol: number, pan = 0) {
  const a = Math.max(0, Math.floor(t0 * SR)), b = Math.min(N, Math.floor((t0 + dur) * SR));
  const gl = vol * Math.cos((pan + 1) * Math.PI / 4), gr = vol * Math.sin((pan + 1) * Math.PI / 4);
  for (let i = a; i < b; i++) { const v = fn(i / SR - t0); L[i] += v * gl; R[i] += v * gr; }
}
const env = (u: number, a: number, d: number) => Math.min(1, u / a) * Math.exp(-u * d);
const lp = (k: number) => { let y = 0; return (x: number) => (y += k * (x - y)); };   // one-pole low-pass

// ---- the sounds
const boing = (t: number, v = 0.35, f = 330, pan = 0) => { let ph = 0; add(t, 0.45, (u) => { ph += TAU * (f * (1 + 0.35 * Math.sin(TAU * 18 * u) * Math.exp(-u * 6)) * (1 + u * 0.6)) / SR; return Math.sin(ph) * env(u, 0.004, 7); }, v, pan); };
const slide = (t: number, d = 0.6, f0 = 380, f1 = 1700, v = 0.22) => { let ph = 0; add(t, d, (u) => { ph += TAU * (f0 + (f1 - f0) * Math.max(0, u / d) ** 1.4) / SR; return (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * Math.min(1, u / 0.02) * Math.min(1, (d - u) / 0.05); }, v); };
const whoosh = (t: number, d = 0.4, v = 0.3, pan = 0) => { const f = lp(0.12); add(t, d, (u) => f(noise()) * Math.sin(Math.PI * u / d) ** 2 * 3, v, pan); };
const bonk = (t: number, v = 0.4) => { add(t, 0.25, (u) => (Math.sin(TAU * 780 * u) * 0.7 + Math.sin(TAU * 1240 * u) * 0.4) * env(u, 0.001, 28), v); add(t, 0.2, (u) => Math.sin(TAU * (140 - 200 * u) * u) * env(u, 0.002, 20), v * 0.9); };
const clank = (t: number, v = 0.3, base = 520, pan = 0) => { const fr = [1, 2.51, 4.23, 6.07].map((k) => k * base); add(t, 0.5, (u) => fr.reduce((a, f, j) => a + Math.sin(TAU * f * u) * Math.exp(-u * (9 + j * 6)) / (j + 1), 0) * Math.min(1, u / 0.001) + noise() * Math.exp(-u * 120) * 0.4, v, pan); };
const boom = (t: number, v = 0.4) => {   // soft cartoon explosion: low-passed noise puff + a falling sub, 3 ms attack
  const f1 = lp(0.06), f2 = lp(0.25);
  add(t, 0.75, (u) => f2(f1(noise()) * 3) * env(u, 0.003, 5.5), v * 1.6);
  add(t, 0.5, (u) => Math.sin(TAU * (70 * u - 40 * u * u)) * env(u, 0.004, 7), v * 0.8);
};
const crackle = (t: number, d = 0.25, v = 0.18) => { for (let i = 0; i < 9; i++) { const ti = t + (i * 0.37 % 1) * d; add(ti, 0.02, (u) => noise() * Math.exp(-u * 300), v * (0.5 + (i % 3) * 0.25), (i % 2 ? 0.3 : -0.3)); } };
const plip = (t: number, v = 0.22, f = 900) => add(t, 0.12, (u) => Math.sin(TAU * (f * u - 2800 * u * u)) * env(u, 0.002, 30), v);
const puff = (t: number, v = 0.2) => { const f = lp(0.08); add(t, 0.35, (u) => f(noise()) * 3 * env(u, 0.02, 9), v); };
const slap = (t: number, v = 0.3) => { const f = lp(0.4); add(t, 0.08, (u) => f(noise()) * Math.exp(-u * 70), v); add(t, 0.1, (u) => Math.sin(TAU * 220 * u) * Math.exp(-u * 50), v * 0.5); };
const step = (t: number, v = 0.18) => add(t, 0.08, (u) => Math.sin(TAU * (160 - 400 * u) * u) * Math.exp(-u * 50), v);
const twinkle = (t: number, v = 0.06) => [0, 0.09, 0.18].forEach((dt, j) => add(t + dt, 0.3, (u) => Math.sin(TAU * [2093, 2637, 3136][j] * u) * env(u, 0.002, 14), v, j - 1));
const hiss = (t: number, d: number, v = 0.05) => { let y = 0; add(t, d, (u) => { const n = noise(); y += 0.6 * (n - y); return (n - y) * Math.min(1, u / 0.2) * Math.min(1, (d - u) / 0.3); }, v); };
const gurgle = (t: number, d: number, v = 0.12) => { for (let ti = t; ti < t + d; ti += 0.17) plip(ti + ((ti * 7.3) % 0.06), v * 0.6, 420 + ((ti * 113) % 260)); };
const snap = (t: number, v = 0.35) => { add(t, 0.03, () => noise(), v); let ph = 0; add(t + 0.01, 0.5, (u) => { ph += TAU * (220 - 120 * u) / SR; return (2 * ((ph / TAU) % 1) - 1) * env(u, 0.002, 7); }, v * 0.35); };
const flip = (t: number, v = 0.12) => { const f = lp(0.3); add(t, 0.22, (u) => f(noise()) * Math.sin(Math.PI * u / 0.22) * (1 + Math.sin(TAU * 40 * u)) * 0.5, v); };
const ratchet = (t: number, n = 5, v = 0.12) => { for (let i = 0; i < n; i++) add(t + i * 0.06, 0.03, (u) => (Math.sin(TAU * 2400 * u) + noise() * 0.5) * Math.exp(-u * 160), v); };
const jingle = (t: number, v = 0.12) => [0, 0.07, 0.15].forEach((dt, j) => clank(t + dt, v, 1300 + j * 210, j - 1));
const honk = (t: number, v = 0.12) => [0, 0.22].forEach((dt) => { let ph = 0; add(t + dt, 0.16, (u) => { ph += TAU * 330 / SR; return (Math.sin(ph) > 0 ? 0.6 : -0.6) * Math.min(1, u / 0.01) * Math.min(1, (0.16 - u) / 0.02); }, v); });
const vroom = (t: number, d = 1.2, v = 0.16) => { let ph = 0; const f = lp(0.2); add(t, d, (u) => { ph += TAU * (70 + 110 * (u / d)) / SR; return f(2 * ((ph / TAU) % 1) - 1) * (0.7 + 0.3 * Math.sin(TAU * 22 * u)) * Math.min(1, u / 0.05) * Math.min(1, (d - u) / 0.15); }, v); };
// a running engine: soft low "putt" pulses and light valve ticks
const engine = (t0: number, t1: number, rate = 6, v = 0.07) => { for (let t = t0; t < t1 - 0.05; t += 1 / rate) { add(t, 0.1, (u) => Math.sin(TAU * 58 * u) * env(u, 0.004, 30), v); add(t + 0.5 / rate, 0.03, (u) => (Math.sin(TAU * 3100 * u) + noise() * 0.4) * Math.exp(-u * 200), v * 0.25); } };
const whirr = (t0: number, d: number, v = 0.06) => { let ph = 0; add(t0, d, (u) => { ph += TAU * (90 + 70 * Math.min(1, u / 0.8)) / SR; return (Math.sin(ph) + 0.3 * Math.sin(3 * ph)) * Math.min(1, u / 0.3) * Math.min(1, (d - u) / 0.2); }, v); };

const ding = (t: number, v = 0.13) => [[1568, 0], [2349, 0.05]].forEach(([f, dt]) => add(t + dt, 0.6, (u) => (Math.sin(TAU * f * u) + 0.3 * Math.sin(TAU * f * 2.76 * u) * Math.exp(-u * 8)) * env(u, 0.002, 6), v));
// ---- extra sounds for the plane
const jet = (t0: number, d: number, v = 0.08, f0 = 220, f1 = 260) => { let ph = 0; const lpf = lp(0.15); add(t0, d, (u) => { ph += TAU * (f0 + (f1 - f0) * Math.min(1, u / d)) / SR; return (Math.sin(ph) * 0.5 + Math.sin(ph * 2.01) * 0.25 + lpf(noise()) * 1.4) * Math.min(1, u / 0.25) * Math.min(1, (d - u) / 0.25); }, v); };
const spindown = (t: number, v = 0.1) => { let ph = 0; add(t, 1.6, (u) => { ph += TAU * (260 * Math.exp(-u * 1.6) + 40) / SR; return Math.sin(ph) * Math.exp(-u * 1.4); }, v); };
const wind = (t0: number, d: number, v = 0.06) => { const f = lp(0.05); add(t0, d, (u) => f(noise()) * 4 * (0.7 + 0.3 * Math.sin(TAU * 0.7 * u)) * Math.min(1, u / 0.3) * Math.min(1, (d - u) / 0.3), v); };
const click = (t: number, v = 0.3) => { add(t, 0.04, (u) => (Math.sin(TAU * 2600 * u) + noise() * 0.5) * Math.exp(-u * 150), v); add(t + 0.06, 0.05, (u) => (Math.sin(TAU * 1800 * u) + noise() * 0.4) * Math.exp(-u * 120), v * 0.8); };
const bell = (t: number, v = 0.12) => [0, 0.18].forEach((dt) => add(t + dt, 0.6, (u) => (Math.sin(TAU * 2200 * u) + 0.5 * Math.sin(TAU * 3300 * u)) * env(u, 0.002, 7), v));
const thud = (t: number, v = 0.35) => add(t, 0.25, (u) => Math.sin(TAU * (90 - 60 * u) * u) * env(u, 0.002, 18) + noise() * Math.exp(-u * 60) * 0.3, v);
const paper = (t: number, v = 0.12) => { const f = lp(0.5); add(t, 0.35, (u) => f(noise()) * Math.sin(Math.PI * u / 0.35), v); };

// ---- the cues, scene by scene (times match the animation in visuals3d.ts)
const stomp = (t: number, v = 0.32) => { add(t, 0.35, (u) => Math.sin(TAU * (55 - 30 * u) * u) * env(u, 0.003, 9), v); const f = lp(0.08); add(t, 0.3, (u) => f(noise()) * 2 * env(u, 0.005, 14), v * 0.5); };
const rumble = (t: number, d = 1.4, v = 0.22) => { let ph = 0; add(t, d, (u) => { ph += TAU * (42 + 6 * Math.sin(TAU * 3 * u)) / SR; return Math.sin(ph) * Math.min(1, u / 0.1) * Math.min(1, (d - u) / 0.3); }, v); };
const squawk = (t: number, v = 0.16, f0 = 900) => { let ph = 0; add(t, 0.28, (u) => { ph += TAU * (f0 + 400 * Math.sin(TAU * 9 * u)) / SR; return (Math.sin(ph) > 0 ? 0.5 : -0.5) * env(u, 0.01, 8); }, v); };
const cluck = (t: number, v = 0.12) => [0, 0.14, 0.24].forEach((dt, i) => add(t + dt, 0.07, (u) => Math.sin(TAU * (520 + i * 40) * u) * env(u, 0.003, 40), v));
const coo = (t: number, v = 0.1) => { let ph = 0; add(t, 0.6, (u) => { ph += TAU * (300 - 60 * u) / SR; return Math.sin(ph) * (0.6 + 0.4 * Math.sin(TAU * 12 * u)) * env(u, 0.05, 4); }, v); };
const splash = (t: number, v = 0.3) => { const f = lp(0.3); add(t, 0.9, (u) => f(noise()) * 2.2 * env(u, 0.01, 4), v); };
const tape = (t: number, v = 0.12) => { const f = lp(0.6); add(t, 0.25, (u) => f(noise()) * (u < 0.2 ? 1 : 0.3) * Math.sin(Math.PI * u / 0.25), v); };
const count = (t0: number, t1: number, v = 0.04) => { for (let t = t0; t < t1; t += 0.07) plip(t, v, 1400 + ((t * 900) % 400)); };
const steps = (t0: number, t1: number, rate = 2.2, v = 0.16) => { for (let t = t0; t < t1; t += 1 / rate) stomp(t, v); };
const k = (s: string, key: string) => K(s, key);
stomp(k('hook', 'rawr') - 0.05, 0.2); squawk(k('hook', 'rawr'), 0.08, 300); thud(k('hook', 'lamp') + 0.55, 0.3); crackle(k('hook', 'lamp') + 0.58, 0.2, 0.1); boing(k('mintieron', 'mint'), 0.14, 300); twinkle(k('promesa', 'vivo'), 0.06);
steps(T0('famoso') + 0.3, k('famoso', 'door') - 0.6, 3, 0.08); add(k('famoso', 'door') - 0.2, 0.6, (u) => Math.sin(TAU * (180 + 90 * u) * u) * env(u, 0.05, 3), 0.1); clank(k('famoso', 'door') + 0.2, 0.08, 300);
slide(k('pavo', 'shrink'), 0.5, 900, 300, 0.12); boing(k('pavo', 'shrink') + 0.4, 0.14, 500); add(k('pavo', 'pavo') - 0.2, 0.5, (u) => Math.sin(TAU * (700 + 200 * Math.sin(TAU * 14 * u)) * u) * env(u, 0.02, 6), 0.08);
twinkle(k('hueso', 'plumas'), 0.07); whoosh(k('hueso', 'bone') - 0.3, 0.8, 0.16); ding(k('hueso', 'knobs'), 0.12); squawk(k('pollo', 'dota') + 0.3, 0.07, 1100);
steps(T0('deino'), T1('deino'), 2.8, 0.04); boing(k('deino', 'deino'), 0.12, 280); boing(k('deino', 'name'), 0.12, 520);
boing(k('chido', 'dota'), 0.14, 380); slap(k('mereces', 'palm') + 0.1, 0.25);
steps(T0('peor'), k('peor', 'rex'), 1.6, 0.2); stomp(k('peor', 'rex'), 0.4); rumble(k('peor', 'rex'), 1.0, 0.18);
add(k('dilofake', 'spit') - 0.05, 0.3, (u) => (noise() * 0.6 + Math.sin(TAU * 200 * u)) * env(u, 0.01, 14), 0.14); plip(k('dilofake', 'spit') + 0.6, 0.12, 300); flip(k('dilofake', 'frill'), 0.16); [0, 0.08, 0.16].forEach((dt) => plip(k('dilofake', 'frill') + dt, 0.06, 1500));
thud(k('inventado', 'stamp'), 0.35); stomp(k('dilo', 'big'), 0.25); honk(k('dilo', 'truck'), 0.08); paper(k('disfraz', 'frill') - 0.1, 0.14);
for (let t = T0('rey'); t < T1('rey') - 0.2; t += 1 / 3) stomp(t, 0.12); crackle(k('rey', 'rey'), 0.4, 0.08); add(T0('rey'), T1('rey') - T0('rey'), (u) => { const f2 = lp(0.04); return f2(noise()) * 0.5; }, 0.05);
bonk(k('huellas', 'x'), 0.2); whoosh(k('subibaja', 'horiz') - 0.1, 0.8, 0.16); stomp(k('subibaja', 'horiz') + 0.8, 0.2); boing(k('subibaja', 'sube'), 0.1, 260);
add(k('quieto', 'freeze'), 0.3, (u) => Math.sin(TAU * 1800 * u) * env(u, 0.002, 20), 0.08); rumble(k('ojos', 'ojos'), 0.8, 0.08); twinkle(k('ojos', 'bien'), 0.06);
for (let i = 0; i < 4; i++) add(k('mejor', 'sniff') + i * 0.3, 0.2, (u) => lp(0.2)(noise()) * Math.sin(Math.PI * u / 0.2), 0.2); plip(k('mejor', 'sniff') + 1.3, 0.1, 1300);
add(k('rugido', 'roar'), 0.4, () => 0, 0); cluck(k('rugido', 'aves') + 0.1); add(k('rugido', 'aves') + 0.6, 0.4, (u) => Math.sin(TAU * 90 * u) * env(u, 0.02, 6), 0.12);
rumble(k('retumbo', 'boom'), 2.0, 0.3); splash(k('retumbo', 'agua') + 0.1, 0.06); thud(k('retumbo', 'cree'), 0.2);
boing(k('plumasrex', 'dota'), 0.12, 400); twinkle(k('yuty', 'name'), 0.06); for (let i = 0; i < 7; i++) tape(k('escamas', 'tape') + i * 0.12); rumble(k('escamas', 'shake'), 0.9, 0.18); whoosh(k('escamas', 'shake') + 0.1, 0.6, 0.18); thud(k('escamas', 'shake') + 0.8, 0.2);
for (let t = k('colores', 'paint') - 0.4; t < k('colores', 'paint') + 1.2; t += 0.18) add(t, 0.15, (u) => lp(0.5)(noise()) * Math.sin(Math.PI * u / 0.15), 0.08); twinkle(k('bolsitas', 'micro'), 0.06);
boing(k('sino', 'name'), 0.12, 600); boing(k('sino', 'mapache') - 0.1, 0.12, 400); boing(k('dientes', 'dota'), 0.14, 340);
stomp(k('monstruos', 'smash') - 0.4, 0.2); boom(k('monstruos', 'smash'), 0.22); crackle(k('monstruos', 'smash') + 0.05, 0.4, 0.12);
ding(k('nidos', 'montana'), 0.1); for (let i = 0; i < 5; i++) plip(k('nidos', 'nidos') + i * 0.08, 0.06, 600); for (let i = 0; i < 6; i++) squawk(k('nidos', 'crias') + i * 0.1, 0.04, 1600 + i * 80);
steps(T0('madre'), k('madre', 'comer'), 1.8, 0.12); for (let i = 0; i < 6; i++) squawk(k('madre', 'comer') + 0.2 + i * 0.12, 0.04, 1700); twinkle(k('madre', 'name'), 0.06);
for (let i = 0; i < 3; i++) add(k('enfermo', 'dota') + i * 0.5, 0.15, (u) => Math.sin(TAU * 400 * u) * env(u, 0.01, 20), 0.06); add(k('toneladas', 'ton'), 0.6, (u) => (Math.sin(TAU * 140 * u) + noise() * 0.3) * env(u, 0.02, 5), 0.18); stomp(k('toneladas', 'ton'), 0.3);
hiss(k('shh', 'shh'), 0.7, 0.07);
splash(T0('lago') + 0.4, 0.1); for (let t = T0('lago'); t < T1('lago'); t += 1.3) plip(t, 0.04, 400); paper(k('lago', 'name'), 0.1);
steps(T0('tierra'), T1('tierra'), 1.4, 0.18); thud(k('borrado', 'x'), 0.2); add(k('borrado', 'x'), 0.4, (u) => lp(0.5)(noise()) * Math.sin(Math.PI * u / 0.4), 0.12); thud(k('borrado', 'stamp'), 0.4); count(k('borrado', 'x'), k('borrado', 'stamp'), 0.03);
for (let i = 0; i < 6; i++) plip(T0('contratar') + 0.3 + i * 0.07, 0.06, 1200 + i * 100); twinkle(T0('contratar') + 0.4, 0.06);
for (let t = T0('cuando'); t < T1('cuando'); t += k('cuando', 'cuando') < t ? 0.06 : 0.5) add(t, 0.04, (u) => Math.sin(TAU * 2400 * u) * Math.exp(-u * 120), 0.06);
for (let i = 0; i < 6; i++) squawk(T0('vecinos') + 0.3 + i * 0.6, 0.04, 400 + i * 120); boing(k('vecinos', 'vec'), 0.14, 300);
count(T0('tres') + 0.1, k('tres', 'n160') + 0.5); ['tri', 'jur', 'cre'].forEach((x, i) => boing(k('tres', x) - 0.25, 0.12, 300 + i * 120));
['rex', 'raptor', 'trike'].forEach((x) => { stomp(k('cretacico', x) - 0.3, 0.08); boing(k('cretacico', x), 0.1, 420); });
boing(k('escupe', 'dota'), 0.12, 360); slide(k('jurasico', 'tug') - 1.2, 1.2, 300, 700, 0.06); whoosh(k('jurasico', 'tug'), 0.5, 0.18); boing(k('jurasico', 'tug') + 0.4, 0.16, 200);
stomp(k('pelea', 'fight') - 0.4, 0.3); boom(k('pelea', 'fight'), 0.2); whoosh(k('pelea', 'fight') + 0.1, 0.4, 0.2);
whoosh(T0('linea'), 0.8, 0.12); ding(k('linea', 'stego'), 0.1); boing(k('linea', 'ti'), 0.12, 500); boing(k('mas', 'dota'), 0.14, 600);
boing(k('espino', 'spino'), 0.12, 300); boing(k('espino', 'cont'), 0.12, 420); stomp(k('trike', 'face'), 0.3); ding(k('trike', 'check'), 0.12);
steps(T0('humanos'), k('humanos', 'pausa'), 1.5, 0.1); add(k('humanos', 'pausa'), 0.15, (u) => Math.sin(TAU * 1000 * u) * env(u, 0.002, 30), 0.12); whoosh(k('humanos', 'gap'), 0.6, 0.12);
add(k('nadie', 'nadie'), 0.6, (u) => Math.sin(TAU * (400 - 250 * u) * u) * env(u, 0.02, 3), 0.08);
for (let t = T0('ptero'); t < T1('ptero'); t += 0.55) whoosh(t, 0.3, 0.05); squawk(k('ptero', 'ptero'), 0.06, 1300); bonk(k('ptero', 'no'), 0.18);
splash(k('mosa', 'jump') - 0.1, 0.25); slap(k('mosa', 'eat'), 0.3); splash(k('mosa', 'eat') + 0.7, 0.22);
steps(T0('dimetro'), k('dimetro', 'mano') - 0.6, 3, 0.05); slap(k('dimetro', 'mano'), 0.15); boing(k('primo', 'dota'), 0.14, 340);
add(k('acabaron', 'shadow') - 0.2, 1.2, (u) => Math.sin(TAU * 60 * u) * Math.sin(Math.PI * u / 1.2), 0.08); count(k('acabaron', 'n66') - 0.8, k('acabaron', 'n66') + 0.2);
whoosh(k('asteroide', 'ast') - 0.6, 1.4, 0.2); boom(k('asteroide', 'ast') + 0.8, 0.45); rumble(k('asteroide', 'ast') + 0.8, 2.2, 0.25); ding(k('asteroide', 'yuc'), 0.1); ding(k('asteroide', 'chic'), 0.08);
wind(T0('polvo'), T1('polvo') - T0('polvo'), 0.08); hiss(k('polvo', 'plantas'), 1.2, 0.05); thud(k('polvo', 'dinos'), 0.2);
twinkle(k('casi', 'casi'), 0.05); ['vivo', 'aves', 'son'].forEach((x) => { twinkle(k('aves', x), 0.06); puff(k('aves', x), 0.1); }); coo(k('aves', 'aves') + 0.4); cluck(k('aves', 'son') + 0.3);
slide(k('rama', 'rama'), 0.8, 300, 900, 0.08); cluck(k('rama', 'rama') + 0.8); cluck(k('gallina', 'gallina')); rumble(k('gallina', 'voltea'), 1.4, 0.3);
for (let i = 0; i < 4; i++) step(T0('consejo') + 0.3 + i * 0.5, 0.06); coo(T0('consejo') + 1.2, 0.06); coo(k('palomas', 'paloma'), 0.1); squawk(k('palomas', 'paloma') + 0.6, 0.06, 700);
boing(T0('sub') + 0.05, 0.22, 260); ding(T0('sub') + 0.35, 0.14); for (let i = 0; i < 6; i++) squawk(k('sub', 'pollo') - 0.5 + i * 0.3, 0.08, 800 + (i % 2) * 300); for (let t = k('sub', 'pollo') - 0.6; t < T1('sub') - 0.1; t += 0.14) step(t, 0.05);

// every piece marker (scenes.json "marks"): a bright "ding" as the ring lands, and a whoosh when the camera zooms to it
for (const s of P.scenes) for (const m of s.marks || []) { const t = K(s.id, m.k) + (m.dt || 0); ding(t + 0.12); if (m.z) whoosh(t + 0.15, 0.35, 0.18); }

// ---- foley.wav (float), then own-music.wav = music + foley
const FOLEY_DB = 12;
const wav = (file: string, a: Float32Array, b: Float32Array) => {
  const n = a.length, buf = Buffer.alloc(44 + n * 8);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 8, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(3, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 8, 28); buf.writeUInt16LE(8, 32); buf.writeUInt16LE(32, 34); buf.write('data', 36); buf.writeUInt32LE(n * 8, 40);
  for (let i = 0; i < n; i++) { buf.writeFloatLE(a[i], 44 + i * 8); buf.writeFloatLE(b[i], 48 + i * 8); }
  fs.writeFileSync(file, buf);
};
const fw = path.join(V, 'foley.wav'); wav(fw, L, R);
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const f = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(V, 'music.wav'), '-i', fw, '-filter_complex',
  `[1:a]volume=${FOLEY_DB}dB[f];[0:a][f]amix=inputs=2:normalize=0:duration=first`, '-c:a', 'pcm_f32le', path.join(V, 'own-music.wav')], { stdio: 'inherit' });
if (f.status !== 0) process.exit(1);
console.log(`foley.wav: peak ${(20 * Math.log10(pk)).toFixed(1)} dBFS, mixed at +${FOLEY_DB} dB into own-music.wav (render now: node core/render.ts videos/dinos)`);
