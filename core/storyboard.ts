#!/usr/bin/env node
// Pipeline step 4: one numbered key frame per scene, to approve before the full render.
//   usage: node core/storyboard.ts videos/<topic> [--times 2.5,9,14]
//   writes videos/<topic>/storyboard.png (numbered panels) and storyboard.md (panel -> scene, time, title)
//   Each panel grabs the scene at ~62% of its length (title and highlight already in place).
//   The zones that TikTok/Reels/Shorts cover with their interface are tinted red (SAFE in style.ts): nothing important
//   should be there. --no-guides leaves the panels clean.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { load, SAFE } from './style.ts';

const argv = process.argv.slice(2);
const guides = !argv.includes('--no-guides'); if (!guides) argv.splice(argv.indexOf('--no-guides'), 1);
const ti = argv.indexOf('--times'), forced = ti >= 0 ? argv.splice(ti, 2)[1].split(',').map(Number) : null;
if (!argv[0]) { console.error('usage: node core/storyboard.ts videos/<topic>'); process.exit(2); }
const { v, E, A } = await load(argv[0]);
A.build(v);
const S = E.scenes, times = forced || S.map((s) => +Math.min(s.t1 - 0.05, s.t0 + Math.max(0.9, (s.t1 - s.t0) * 0.62)).toFixed(2));
const tmp = path.join(v, 'storyboard'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
const pngs = await A.frames(v, times, tmp);
const cols = Math.min(4, pngs.length), rows = Math.ceil(pngs.length / cols);
const font = ['/System/Library/Fonts/Supplemental/Arial Bold.ttf', '/System/Library/Fonts/Helvetica.ttc', 'C:/Windows/Fonts/arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'].find((f) => fs.existsSync(f));
const zone = (x: number, y: number, w: number, h: number) => `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=red@0.22:t=fill,`;
const tint = guides ? zone(0, 0, 1080, SAFE.top) + zone(0, SAFE.bottom, 1080, 1920 - SAFE.bottom) + zone(SAFE.right, SAFE.top, 1080 - SAFE.right, SAFE.bottom - SAFE.top) + zone(0, SAFE.top, SAFE.left, SAFE.bottom - SAFE.top) : '';
const r = spawnSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '1', '-i', path.join(tmp, 'p%02d.png'), '-vf',
  `${tint}scale=360:640,drawbox=x=0:y=0:w=62:h=50:color=black@0.75:t=fill,drawtext=${font ? `fontfile='${font.replace(':', '\\:')}':` : ''}text='%{eif\\:n+1\\:d}':x=14:y=8:fontsize=34:fontcolor=yellow,pad=372:652:6:6:color=0x222222,tile=${cols}x${rows}`,
  '-frames:v', '1', path.join(v, 'storyboard.png')], { stdio: 'inherit' });
if (r.status !== 0) process.exit(1);
const md = ['| panel | scene | t (s) | type | title | stat |', '|---|---|---|---|---|---|', ...S.map((s, i) => `| ${i + 1} | ${s.id} | ${times[i] ?? ''} | ${s.type} | ${s.title || ''} | ${s.stat ? s.stat.value : ''} |`)];
fs.writeFileSync(path.join(v, 'storyboard.md'), `# Storyboard: ${path.basename(v)} (${E.style})\n\n![storyboard](storyboard.png)\n\n${md.join('\n')}\n`);
console.log(`storyboard: ${pngs.length} panels -> ${path.join(argv[0], 'storyboard.png')} (+ storyboard.md)`);
