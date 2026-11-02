#!/usr/bin/env node
// Pipeline steps 5 + 6: full render with the style's framework, mix with the voice and the music, review.
//   usage: node core/render.ts videos/<topic> [--no-music] [--music -16]
//   -> videos/<topic>/final.mp4 and videos/<topic>/report.md
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { load, ROOT } from './style.ts';

const argv = process.argv.slice(2);
const noMusic = argv.includes('--no-music');
const mi = argv.indexOf('--music'), musicDb = mi >= 0 ? argv[mi + 1] : '-16';
if (!argv[0] || argv[0].startsWith('--')) { console.error('usage: node core/render.ts videos/<topic>'); process.exit(2); }
const { v, E, A } = await load(argv[0]);
const t0 = Date.now();
const node = (script: string, ...a: string[]) => { const r = spawnSync(process.execPath, [path.join(ROOT, 'core', script), ...a], { stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };
console.log(`== ${path.basename(v)}: style ${E.style} (${A.engine})`);
A.build(v);
const silent = await A.video(v);
// music: yours (own-music.wav/.mp3) if you added it; otherwise the one synthesized from the scenes
if (noMusic) fs.rmSync(path.join(v, 'music.wav'), { force: true });
else if (!['wav', 'mp3', 'm4a'].some((x) => fs.existsSync(path.join(v, `own-music.${x}`)))) node('music.ts', v);
node('mix.ts', v, silent, '--music', musicDb);
console.log(`render: ${((Date.now() - t0) / 1000).toFixed(0)} s`);
node('review.ts', v);
