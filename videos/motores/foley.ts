#!/usr/bin/env node
// Cartoon foley for "motores": a layer of sound effects with their own level, on top of the synthesized music.
//   usage: node videos/motores/foley.ts            (run it after any change to scenes.json, then render)
//   1) runs core/music.ts -> music.wav (the score with its own sfx), 2) synthesizes foley.wav from the cues below,
//   3) writes own-music.wav = music + foley (+FOLEY_DB). mix.ts puts it 16 dB under the voice, so the foley lands ~4 dB under it (and ducks while someone talks).
//   Deterministic: no clocks, a seeded noise. Explosions are soft (low-passed, short, no clipping).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const V = path.dirname(new URL(import.meta.url).pathname), ROOT = path.resolve(V, '../..');
const r = spawnSync(process.execPath, [path.join(ROOT, 'core', 'music.ts'), V], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);

type Sc = { id: string; t0: number; t1: number; keys?: { id: string; t: number }[] };
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
const slide = (t: number, d = 0.6, f0 = 380, f1 = 1700, v = 0.22) => { let ph = 0; add(t, d, (u) => { ph += TAU * (f0 + (f1 - f0) * (u / d) ** 1.4) / SR; return (Math.sin(ph) + 0.25 * Math.sin(2 * ph)) * Math.min(1, u / 0.02) * Math.min(1, (d - u) / 0.05); }, v); };
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

// ---- the cues, scene by scene (times match the animation in visuals.ts)
boing(K('hook', 'q'), 0.18, 420);
clank(K('ruin', 'rompe'), 0.3, 480); clank(K('ruin', 'rompe') + 0.12, 0.2, 610, 0.3); clank(K('ruin', 'rompe') + 0.24, 0.15, 540, -0.3);
puff(K('ruin', 'rompe') + 0.1); puff(K('ruin', 'rompe') + 0.4); puff(K('ruin', 'entero'), 0.25);
boing(K('ask', 'dota') - 0.25, 0.32, 300);
slap(K('idiot', 'palm') + 0.12); boing(K('idiot', 'idiota') + 0.1, 0.2, 380);
whoosh(K('armo', 'tube') - 0.25, 0.3, 0.25); clank(K('armo', 'tube') + 0.08, 0.32, 440); clank(K('armo', 'tube') + 0.2, 0.14, 440); clank(K('armo', 'tube') + 0.3, 0.07, 440);
whoosh(K('tube', 'gas') - 0.1, 0.4, 0.15); plip(K('tube', 'gas') + 0.4, 0.3, 700); crackle(K('tube', 'spark')); boom(K('tube', 'boom'), 0.42); puff(K('tube', 'boom') + 0.2, 0.25);
whoosh(K('piston', 'lid') - 0.35, 0.35, 0.2); clank(K('piston', 'lid') + 0.1, 0.3, 400); boom(K('piston', 'push') - 0.05, 0.35); clank(K('piston', 'push') + 0.18, 0.35, 350);
[0, 0.3, 0.6].forEach((dt, i) => boing(K('stuck', 'cheer') + dt, 0.22, 300 + i * 40, 0.5));
boom(K('stuck', 'down') - 0.05, 0.35); clank(K('stuck', 'down') + 0.18, 0.35, 350); [0, 0.12, 0.24, 0.36].forEach((dt) => clank(K('stuck', 'stuck') + dt, 0.16, 360 + dt * 200));
ratchet(K('rod', 'crank') + 0.6, 8); engine(K('rod', 'crank') + 0.6, T1('rod'), 3);
engine(T0('cycle'), T1('cycle'), 7); engine(T0('names'), T1('names'), 4);
puff(K('closed', 'smoke'), 0.15); clank(K('closed', 'smoke'), 0.15, 300);
boing(K('valves', 'holes'), 0.15, 520); engine(K('valves', 'in') - 0.3, K('valves', 'in') + 1.3, 4, 0.05); puff(K('valves', 'out'), 0.25);
boing(K('vname', 'dota') - 0.15, 0.25, 340, 0.6);
boing(K('timing', 'q') - 0.1, 0.18, 460);
ratchet(K('cams', 'cams'), 4); engine(K('cams', 'cams') + 0.4, T1('cams'), 6);
engine(T0('ratio'), T1('ratio'), 6);
whoosh(K('plug', 'plug') - 0.3, 0.3, 0.15); clank(K('plug', 'plug') + 0.05, 0.22, 900); ratchet(K('plug', 'plug') + 0.25, 6, 0.1);
crackle(K('bujia', 'squeeze'), 0.2, 0.2); boom(K('bujia', 'squeeze') + 0.03, 0.25); engine(K('bujia', 'squeeze') - 0.8, K('bujia', 'squeeze') + 0.8, 4, 0.05);
engine(T0('disc'), T1('disc'), 7); whirr(K('disc', 'fly'), T1('disc') - K('disc', 'fly'));
engine(T0('inercia'), T1('inercia'), 7); whirr(T0('inercia'), T1('inercia') - T0('inercia'));
// Dota touches the flywheel: hops, a "boop", a zap, the launch whistle, and a crash far away
[0.2, 0.5].forEach((dt) => boing(T0('touch') + dt, 0.22, 340, 0.5)); whirr(T0('touch'), T1('touch') - T0('touch'), 0.07);
add(K('touch', 'reach') + 0.05, 0.1, (u) => Math.sin(TAU * (600 + 900 * u) * u) * env(u, 0.003, 25), 0.18);
crackle(K('touch', 'fly'), 0.2, 0.22); bonk(K('touch', 'fly') + 0.15, 0.3);
slide(K('touch', 'fly') + 0.2, 0.65); whoosh(K('touch', 'fly') + 0.25, 0.6, 0.3, 0.4);
bonk(T1('touch') + 0.15, 0.16); clank(T1('touch') + 0.25, 0.1, 700, 0.6); clank(T1('touch') + 0.35, 0.07, 820, 0.7);
// heat: Dota walks back dizzy, the metal sizzles and the engine jams
[0.15, 0.35, 0.55, 0.75].forEach((dt) => step(T0('heat') + dt, 0.16)); for (let t = T0('heat') + 0.4; t < T1('heat') - 0.3; t += 1.1) twinkle(t, 0.04);
engine(T0('heat'), K('heat', 'jam'), 7); hiss(K('heat', 'heat'), T1('heat') - K('heat', 'heat'), 0.06); clank(K('heat', 'jam'), 0.3, 300); clank(K('heat', 'jam') + 0.1, 0.2, 260);
for (let i = 0; i < 5; i++) plip(K('oil', 'oil') - 0.3 + i * 0.12 + 0.6, 0.18, 760 - i * 40); engine(K('oil', 'oil') + 0.3, T1('oil'), 5);
engine(T0('rad'), T1('rad'), 6, 0.05); gurgle(K('rad', 'liquid'), T1('rad') - K('rad', 'liquid')); hiss(K('rad', 'rad') + 0.3, 1.6, 0.05);
whoosh(K('promised', 'reveal') - 0.25, 0.4, 0.25); engine(K('promised', 'reveal'), T1('promised'), 5, 0.05);
engine(T0('links'), T1('links'), 6, 0.06);
engine(T0('snap'), K('snap', 'snap'), 6, 0.06); snap(K('snap', 'snap')); clank(K('snap', 'snap') + 0.3, 0.15, 500);
bonk(K('snap', 'hit'), 0.4); clank(K('snap', 'hit') + 0.02, 0.3, 380); twinkle(K('snap', 'hit') + 0.1, 0.06);
engine(T0('dist'), T1('dist'), 6, 0.05);
flip(K('manual', 'man') - 0.2); flip(K('manual', 'man') - 0.05, 0.08);
boom(K('outro', 'boom'), 0.25); vroom(K('outro', 'drive'), 1.25); honk(K('outro', 'drive') + 0.7);
for (let i = 0; i < 5; i++) { puff(T0('sub') + 0.2 + i * 0.95, 0.12); puff(T0('sub') + 0.65 + i * 0.95, 0.1); }
[0.2, 0.5].forEach((dt) => boing(T0('sub') + dt, 0.18, 320, 0.4)); jingle(K('sub', 'screws') + 0.05);

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
console.log(`foley.wav: peak ${(20 * Math.log10(pk)).toFixed(1)} dBFS, mixed at +${FOLEY_DB} dB into own-music.wav (render now: node core/render.ts videos/motores)`);
