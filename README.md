# Audio-driven animation

You give it **the script's audio** (a narration: yours, someone else's or a generated one, with or without music) and the AI builds a 9:16 animated video synced to what it says. Optionally you pass **assets** (a logo, screenshots) and **notes** (colors, tone, specific scenes).

It's all code and it renders locally: no paid templates, no stock footage, nothing uploaded to the cloud. The code is TypeScript that Node runs directly, with no build step.

## Styles

| style | framework | good for |
|---|---|---|
| [Flat 2D](styles/flat2d/USAGE.md) | [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + SVG + GSAP) | flat, saturated vector: science, fun facts, explainers |
| [3D](styles/3d/USAGE.md) | [HyperFrames](https://github.com/heygen-com/hyperframes) + [Three.js](https://threejs.org) | low-poly with textured heroes (fur, wood, soil): physics, machines, vehicles, animals, "how it works" with volume |

More styles are coming.

## How it works

```
audio (+ assets, notes) + style
 1. Transcribe    every word with its timing                core/transcribe.py   (faster-whisper, local)
 2. Analyze       phrases, pauses, numbers                  core/analyze.ts
 3. Visual plan   the AI writes scenes.json                 (the agent, validated with core/scenes.ts)
 4. Storyboard    one frame per scene, to approve           core/storyboard.ts  (+ live preview: core/preview.ts)
 5. Render        the style's framework                     core/render.ts
 6. Review        sync, loudness, text, cuts                core/review.ts
 → videos/<topic>/final.mp4 + report.md
```

The contract is `scenes.json`: a list of scenes that point at **words** in the audio (not at seconds). The style turns that file into animation:
- its **library** ships generic scenes per type (question, object, process, comparison, stat, map, asset, closing);
- the AI writes each video's **custom visuals** in `videos/<topic>/visuals.ts` (`visuals3d.ts` in 3D).

On top sits a **titles layer**: a label, a title whose key word gets highlighted when you say it, and a card with the stat.

## Start from zero

You install just one thing by hand: Claude Code. Everything else (Git, Node, ffmpeg, Python, the project and its dependencies) Claude installs for you.

**1. Install Claude Code.** You need a Claude account (Pro or Max plan). Pick one:
- **Desktop app:** download it from [claude.ai/download](https://claude.ai/download) and open the **Code** tab.
- **Terminal:** on macOS or Linux paste `curl -fsSL https://claude.ai/install.sh | bash`. On Windows follow [the official guide](https://docs.claude.com/en/docs/claude-code/setup). Then type `claude`.

**2. Open Claude Code in any folder**, for example your Desktop. The project will be downloaded there.

**3. Paste the setup prompt** of the style you want: copy the block in [prompts/setup-flat2d.md](prompts/setup-flat2d.md) or [prompts/setup-3d.md](prompts/setup-3d.md) and send it. Claude installs whatever is missing, downloads the project and makes you a basic test animation (no voice). It opens in a preview in your browser (http://localhost:3002 for Flat 2D, http://localhost:3003 for 3D, or the one it tells you if that port is busy): when it plays, you're ready. It ends with a summary of what it did and how to get familiar with the project. If at some point it needs your computer's password, it tells you what to paste and where.

**4. Make your video**: open a new chat in Claude Code in the `viral-claude-shorts` folder, drag the script's audio in and say what you want, for example *"anima este audio, la idea es explicar por qué el pan se pone duro"* (add *"en 3D"* for that style). The project's `CLAUDE.md` tells Claude the whole process: it shows you an art plan (every object, set and camera move) and then a storyboard, waits for your approval at each one and delivers `videos/<topic>/final.mp4`. Want more control (assets, colors, specific scenes)? Use the template in [prompts/production.md](prompts/production.md).

<details>
<summary>Doing it by hand, without Claude Code</summary>

With Git, Node 22.18+, ffmpeg and Python 3.10 to 3.14 installed (3.15 can't install the transcription yet: use `python3.12` in its place), from the repo folder:

```bash
python3 -m venv .venv && .venv/bin/pip install faster-whisper
```

```bash
npm install && cd styles/flat2d && npm install
```

For the 3D style, instead (or as well):

```bash
npm install && cd styles/3d && npm install
```

One video, with your audio at `videos/my-topic/audio.wav`:

```bash
.venv/bin/python core/transcribe.py videos/my-topic
node core/analyze.ts videos/my-topic
# (write videos/my-topic/scenes.json, plan.md and visuals.ts, or visuals3d.ts in 3D)
node core/scenes.ts videos/my-topic
npm run typecheck
node core/storyboard.ts videos/my-topic
node core/render.ts videos/my-topic
```

To watch it moving with its audio: `node core/preview.ts videos/my-topic` opens http://localhost:3002 (3003 in 3D), or reuses it if it's already open. It stays open in the background; `--stop` closes it.

Transcription assumes Spanish; for another language add `--language en` (or its code) to `transcribe.py`.

No recorded audio? `node core/voice.ts videos/my-topic` generates it from `script.json` with your cloned voice on a local [voicebox](http://127.0.0.1:17493) server, in a single take so the intonation flows.

</details>

**Two rules that make it feel smooth:**
- **Cuts land in the pauses.** Short connectors stay as the tail of the previous scene.
- **No animation is left half done.** The validator rejects keys closer than 0.7 s to the cut, and the title highlight never starts that late.

## Structure

```
core/            transcribe, analyze, scenes (contract), storyboard, preview, render, mix, music, review, voice, typecheck, types
styles/          flat2d/ — adapter, engine, theme, library, INSTALL.md, USAGE.md
                 3d/ — adapter, engine, theme, library (simple pieces), detail (textures, fur, shared set), INSTALL.md, USAGE.md
videos/<topic>/  audio.wav, scenes.json, plan.md, visuals.ts or visuals3d.ts, storyboard.png, final.mp4, report.md
                 blue-sky/, aviones/ and detail-demo/ (simple + textured 3D, no voice) are the examples; hello/ and hello-3d/ are the setups' test animations (made on your computer)
prompts/         setup-flat2d.md, setup-3d.md, production.md
CLAUDE.md        what Claude reads in every chat here: a short request with an audio runs the whole production process
```

## References

Libraries and tools the project uses. npm and pip install them separately (they don't ship inside the repo).

| what | for |
|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | frame-by-frame rendering of the page |
| [GSAP](https://gsap.com) | the animation timeline (the 2D art and the titles) |
| [Three.js](https://threejs.org) | the 3D scenes |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | transcribes the audio with every word's timing |
| [ffmpeg](https://ffmpeg.org) | encodes the video and mixes the audio |
| [TypeScript](https://www.typescriptlang.org) | types for the whole project (`npm run typecheck`) |
| [esbuild](https://esbuild.github.io) | strips the types from the files that run in the browser |
