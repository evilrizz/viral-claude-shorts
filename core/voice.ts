#!/usr/bin/env node
// Script -> audio with your cloned voice (local voicebox server). Only needed if you DON'T bring your own audio.
//   usage: node core/voice.ts videos/<topic> [--server http://127.0.0.1:17493] [--profile "My voice"] [--per-line]
//   By default it generates the WHOLE script in ONE take: the intonation flows between sentences (with --per-line, one take per
//   line joined with pauses: handy to redo a single line, but it sounds choppier).
// reads  videos/<topic>/script.json:
//   { "language": "es", "lead": 0.6, "tail": 1.2, "lines": [ { "id": "hook", "text": "...", "pause": 0.35 }, ... ] }
// writes videos/<topic>/voice/take.wav (or voice/<id>.wav per line; reused if the text didn't change)
//   and videos/<topic>/audio.wav (48 kHz mono: the lines with their pauses) -> the pipeline's input.
// To regenerate a line: delete voice/<id>.wav (or change its text) and run again.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { Script } from './types.ts';

const argv = process.argv.slice(2);
const opt = (k: string, d: string) => { const i = argv.indexOf(k); return i >= 0 ? argv.splice(i, 2)[1] : d; };
const SERVER = opt('--server', process.env.VOICEBOX_URL || 'http://127.0.0.1:17493');
const PROFILE = opt('--profile', process.env.VOICEBOX_PROFILE || 'My voice');
const DIR = argv[0];
if (!DIR) { console.error('usage: node core/voice.ts videos/<topic> [--profile "My voice"]'); process.exit(2); }
const ROOT = path.resolve(DIR), VDIR = path.join(ROOT, 'voice'), SR = 48000;
const G: Script = JSON.parse(fs.readFileSync(path.join(ROOT, 'script.json'), 'utf8'));
fs.mkdirSync(VDIR, { recursive: true });

const api = async (p: string, init?: RequestInit) => { const r = await fetch(SERVER + p, init); if (!r.ok) throw new Error(`${p}: HTTP ${r.status} ${await r.text()}`); return r; };
const profiles: { id: string; name: string }[] = await (await api('/profiles')).json();
const profile = profiles.find((p) => p.name === PROFILE || p.id === PROFILE);
if (!profile) { console.error(`profile "${PROFILE}" does not exist. Profiles: ${profiles.map((p) => p.name).join(', ')}`); process.exit(1); }

async function generate(text: string, seed: number, out: string) {
  const g = await (await api('/generate', { method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ profile_id: profile!.id, text, language: G.language || 'es', seed }) })).json();
  for (let i = 0; ; i++) {   // the first take after starting voicebox is slow: it loads the model
    const h = await (await api(`/history/${g.id}`)).json();
    if (h.status === 'completed') break;
    if (h.status === 'failed' || h.error) throw new Error(`generation failed: ${h.error}`);
    if (i >= 900) throw new Error('voicebox has been generating for 15 minutes: check that its model is loaded');
    await new Promise((r) => setTimeout(r, 1000));
  }
  fs.writeFileSync(out, Buffer.from(await (await api(`/history/${g.id}/export-audio`)).arrayBuffer()));
}

// decodes a take to 48 kHz mono s16, without the silence at the edges
function decode(file: string): Buffer {
  const trim = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03';
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-af', `${trim},areverse,${trim},areverse`, '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 30 });
  if (r.status !== 0) { console.error('could not decode', file); process.exit(1); }
  return r.stdout;
}

const parts: [number, Buffer][] = [];
let t = G.lead ?? 0.6;
const PER_LINE = argv.includes('--per-line');
if (!PER_LINE) {   // a single take: the whole text, with its punctuation as a guide for the pauses
  const text = G.lines.map((L) => L.text.trim()).join(' '), wav = path.join(VDIR, 'take.wav'), txt = path.join(VDIR, 'take.txt');
  if (!fs.existsSync(wav) || !fs.existsSync(txt) || fs.readFileSync(txt, 'utf8') !== text) {
    process.stdout.write(`  generating the full take (${text.length} characters)… `);
    await generate(text, G.seed ?? 7, wav);
    fs.writeFileSync(txt, text);
    console.log('ok');
  }
  const pcm = decode(wav);
  parts.push([Math.round(t * SR), pcm]);
  t += pcm.length / 2 / SR;
}
for (const [i, L] of (PER_LINE ? G.lines : []).entries()) {
  const id = L.id || `l${i + 1}`, wav = path.join(VDIR, `${id}.wav`), txt = path.join(VDIR, `${id}.txt`);
  if (!fs.existsSync(wav) || !fs.existsSync(txt) || fs.readFileSync(txt, 'utf8') !== L.text) {
    process.stdout.write(`  generating "${id}"… `);
    await generate(L.text, L.seed ?? 7, wav);
    fs.writeFileSync(txt, L.text);
    console.log('ok');
  }
  const pcm = decode(wav);
  parts.push([Math.round(t * SR), pcm]);
  t += pcm.length / 2 / SR + (L.pause ?? 0.35);
}
const total = t - (PER_LINE ? (G.lines.at(-1)?.pause ?? 0.35) : 0) + (G.tail ?? 1.2);
const data = Buffer.alloc(Math.ceil(total * SR) * 2);
for (const [s0, pcm] of parts) pcm.copy(data, s0 * 2);
const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28);
h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
fs.writeFileSync(path.join(ROOT, 'audio.wav'), Buffer.concat([h, data]));
console.log(`audio.wav: ${PER_LINE ? `${G.lines.length} takes` : '1 take'}, ${total.toFixed(2)} s (profile "${profile.name}")`);
