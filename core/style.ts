// Loads the adapter of the style that scenes.json asks for (styles/<style>/adapter.ts).
// Every adapter exposes the same thing (the Adapter interface in types.ts): build, frames, video, texts
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Adapter, Plan } from './types.ts';

export const ROOT = path.resolve(import.meta.dirname, '..');
// Safe zone of a 1080x1920 frame: TikTok, Reels and Shorts cover the top (tabs, ~160 px), the bottom (~320 px: caption,
// music) and the edges (buttons). It's symmetric (80 px each side), so the center of the frame is the center of the zone.
// Text, characters and key objects go inside; only backgrounds bleed out.
export const SAFE = { left: 80, right: 1000, top: 160, bottom: 1600 };
export async function load(videoDir: string): Promise<{ v: string; E: Plan; A: Adapter }> {
  const v = path.resolve(videoDir);
  const E: Plan = JSON.parse(fs.readFileSync(path.join(v, 'scenes.json'), 'utf8'));
  const f = path.join(ROOT, 'styles', E.style, 'adapter.ts');
  if (!fs.existsSync(f)) throw new Error(`style "${E.style}" is not installed (missing styles/${E.style}/adapter.ts)`);
  return { v, E, A: (await import(pathToFileURL(f).href)).default };
}
