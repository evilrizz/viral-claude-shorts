#!/usr/bin/env node
// Live preview: builds the video's project and makes sure the style's preview server is running.
//   usage: node core/preview.ts videos/<topic> [--stop]
//   If the server is already open (from the setup or an earlier chat) it reuses it: the page reloads by itself with this video.
//   If not, it starts it in the background and opens the browser. It stays open after the chat ends and always shows
//   the last video built (storyboard, render or this command). --stop closes it.
import { load } from './style.ts';

const argv = process.argv.slice(2);
if (!argv[0] || argv[0].startsWith('--')) { console.error('usage: node core/preview.ts videos/<topic> [--stop]'); process.exit(2); }
const { v, E, A } = await load(argv[0]);
if (!A.preview || !A.stopPreview) { console.error(`the style "${E.style}" has no live preview`); process.exit(1); }
if (argv.includes('--stop')) { A.stopPreview(); console.log('preview closed'); process.exit(0); }
const p = await A.preview(v);
console.log(`preview ${p.started ? 'opened' : 'already open, reloaded with this video'}: ${p.url}`);
if (p.note) console.log('note: ' + p.note);
console.log('it stays open in the background (even if you close the chat); close it with: node core/preview.ts ' + argv[0] + ' --stop');
