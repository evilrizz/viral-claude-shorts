# Flat 2D: install

**Framework:** [HyperFrames](https://github.com/heygen-com/hyperframes) 0.8.166: HTML + SVG + [GSAP](https://gsap.com) 3.15.0, rendered frame by frame in headless Chrome.

## Requirements
| what | version | check |
|---|---|---|
| Node.js | **22.18 or later** (runs the TypeScript directly; tested with 24) | `node -v` |
| ffmpeg | any recent one | `ffmpeg -version` |
| Python | 3.10 or later (for transcription) | `python3 --version` |

## Steps
From the project root (the core: transcription, and TypeScript for the type checks):
```bash
python3 -m venv .venv && .venv/bin/pip install faster-whisper
```
```bash
npm install
```
And the style:
```bash
cd styles/flat2d && npm install
```
```bash
npx hyperframes --version
```
It should answer `0.8.166`. GSAP is copied from `node_modules` into the project (`project/gsap.min.js`), so the render downloads nothing from the internet. `engine.ts`, `library.ts` and each video's `visuals.ts` go into `project/` as plain `.js`: esbuild strips their types.

## Check that it works
From the root, build the example's storyboard (the example ships without its voice, so it isn't rendered to MP4):
```bash
node core/storyboard.ts videos/blue-sky
```
Then look at it moving:
```bash
node core/preview.ts videos/blue-sky
```
It opens http://localhost:3002. The full render (`node core/render.ts videos/<topic>`) runs with the script's audio of each video. The review uses `hyperframes check` for the text: layout, contrast and lint.

## Common problems
- **`missing_timeline_registry`** in the lint: the registration `window.__timelines.main = buildTimeline()` has to be in a `<script>` inside `index.html`. The adapter already puts it there.
- **An SVG object jumps to the edge** when you animate it with `x`/`y`: GSAP replaces the group's `translate`. Put the `id` on a `<g>` without a transform and the position on an inner `<g>` (every library piece is built that way).
- **`node core/....ts` gives a syntax error**: Node is older than 22.18 and can't read TypeScript. Update it.
- **Contrast**: on light backgrounds set `ink: F2.night` on the scene (otherwise `hyperframes check` fails).
