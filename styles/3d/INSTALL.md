# 3D: install

**Framework:** [HyperFrames](https://github.com/heygen-com/hyperframes) 0.8.166 + [Three.js](https://threejs.org) 0.169.0 + [GSAP](https://gsap.com) 3.15.0 for the titles, rendered frame by frame in headless Chrome, on the GPU when there is one.

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
cd styles/3d && npm install
```
```bash
npx hyperframes --version
```
It should answer `0.8.166`. Three.js (bundled by esbuild into one script) and GSAP go from `node_modules` into the project, so the render downloads nothing from the internet. `engine.ts`, `library.ts`, `detail.ts` and each video's `visuals3d.ts` go into `project/` as plain `.js`: esbuild strips their types.

## Check that it works
From the root, build the example's storyboard (the example ships without its voice, so it isn't rendered to MP4):
```bash
node core/storyboard.ts videos/aviones
```
Then look at it moving:
```bash
node core/preview.ts videos/aviones
```
It opens http://localhost:3003. The full render (`node core/render.ts videos/<topic>`) runs with the script's audio of each video. The review uses `hyperframes check` for the text: layout, contrast and lint.

## Common problems
- **The render is very slow:** without a usable GPU, Chrome draws the 3D in software. It still works. The line at the end of the render says `hardware gpu` when it used one.
- **`node core/....ts` gives a syntax error**: Node is older than 22.18 and can't read TypeScript. Update it.
- **The preview's port is taken:** Flat 2D uses 3002 and this style 3003, so both can stay open. If something else is on 3003, close it and run the preview again.
