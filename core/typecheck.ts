#!/usr/bin/env node
// `npm run typecheck`: checks the types of core/ and of every style that's installed on this computer
// (a style without node_modules can't be checked, and you may only be using one of them).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..'), STYLES = path.join(ROOT, 'styles');
const tsc = path.join(ROOT, 'node_modules', '.bin', process.platform === 'win32' ? 'tsc.cmd' : 'tsc');
if (!fs.existsSync(tsc)) { console.error('typecheck: TypeScript is not installed. Run `npm install` at the project root first.'); process.exit(1); }
const installed =fs.readdirSync(STYLES).filter((s) => fs.existsSync(path.join(STYLES, s, 'node_modules')));
const configs = ['tsconfig.json', ...installed.flatMap((s) => [`styles/${s}/tsconfig.adapter.json`, `styles/${s}`])];
let failed = false;
for (const c of configs) {
  const r = spawnSync(tsc, ['-p', c], { cwd: ROOT, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) { console.error(`  ^ errors in ${c}`); failed = true; }
}
console.log(failed ? 'typecheck: there are errors' : `typecheck ok: core${installed.map((s) => ', ' + s).join('')}`);
process.exitCode = failed ? 1 : 0;
