# Production prompt (for more control)

You don't need this to make a video: in a chat opened in the project folder, dragging the audio in and saying "anima este audio" is enough (the project's `CLAUDE.md` makes Claude follow these same steps). Use this template when you want to give more details: assets, colors, tone or specific scenes.

Open Claude Code in the `viral-claude-shorts` folder, copy the block below and, before sending it, fill in the lines that start with ✏️. Assets and notes are optional: if you don't need them, delete those lines. Claude picks the topic name.

```text
Make an animated video with this repo's pipeline.

- ✏️ **Audio:** `<path to your audio: wav, mp3 or m4a; you can drag the file in here>`. Pick a short topic name (lowercase, no spaces or accents), create `videos/<topic>/` and copy the audio there as `audio.<extension>`. If instead of audio there's a `videos/<topic>/script.json`, generate it with `node core/voice.ts videos/<topic>`: it comes out in ONE take so the intonation flows. If you write the script yourself, join the ideas with connectors ("verás", "pero", "así que", "por eso", "o sea"); without them it sounds choppy.
- ✏️ **Style:** `flat2d` or `3d`
- ✏️ **Assets (optional):** `<paths to logos or screenshots>`; copy them to `videos/<topic>/assets/`
- ✏️ **What I want to get across:** `<the idea in one sentence>`
- ✏️ **Notes (optional):** `<colors, tone, specific scenes, things to avoid>`

Follow these steps and don't skip the two approvals (art plan and storyboard):

1. **Read** `styles/<style>/USAGE.md` and look at that style's example video to copy how it works (`flat2d`: `videos/blue-sky/`, with `scenes.json` and `visuals.ts`; `3d`: `videos/aviones/`, with `scenes.json` and `visuals3d.ts`, and `videos/detail-demo/` for mixing simple and textured objects in one shared set).
2. **Transcribe and analyze:**
   - `.venv/bin/python core/transcribe.py videos/<topic>` (it assumes Spanish; for another language add `--language <code>`)
   - `node core/analyze.ts videos/<topic>`

   The phrase table with every word's `#` index is your clock.
3. **Write the plan** in `videos/<topic>/scenes.json`:
   - one scene per idea, 2 to 7 s long, each starting at the word (`from`) where that idea begins. The cut lands in the pause before it. Short connectors ("Verás", "Luego", "O sea") can stay as the tail of the previous scene to give it air;
   - **no animation left half done:** no key closer than 0.7 s to the end of its scene (the validator flags it as an ERROR), and every key-triggered animation lasts 0.5 s at most. Anything continuous (pulses, clouds) loops;
   - `type`: question, object, process, comparison, stat, map, asset or closing;
   - `title`: 40 characters at most, in the language of the audio, and `highlight` must be a word of the title that **is said** in that scene (so it lights up right when it's said);
   - `stat` only when there's a real number; numbers and claims must be verifiable;
   - `keys`: the moments the animation has to react to (`at` = word index).

   Validate with `node core/scenes.ts videos/<topic>` and fix it until there are no errors.
4. **Art plan:** before drawing anything, write `videos/<topic>/plan.md` and **show it to me and wait for my approval**:
   - **Objects:** every object and character, described once and with precision: its parts, proportions (compared with something known: "as tall as a door"), colors and material. In `3d`, say for each one whether it's **textured** (the hero of its scenes: fur, wood, skin, soil with relief) or **simple** (matte low-poly: the background and secondary things). Break complex figures (people, animals, machines) into their pieces, and draw each one alone first (a storyboard with only that object) and show me that picture before using it in the video;
   - **Sets:** where each scene happens, what's in the background, the light (day, night, storm, indoors) and the palette. In `3d`, if the whole video happens in one place, say so: it's built once and shared by every shot (`p3Stage`);
   - **Camera:** for each scene, where it starts, where it ends and how it moves (closer, around, following, from above), and what it frames inside the safe zone. In `flat2d`, the composition and what moves in the frame;
   - **Moments:** what happens at each key (the word that triggers it).
5. **Draw** the visuals with `defineVisuals({ ... })` in `videos/<topic>/visuals.ts` (`flat2d`) or `videos/<topic>/visuals3d.ts` (`3d`), using the style's library and reacting to `K('key')` (`w.K('key')` in 3D), following the approved `plan.md`. Follow the style's rules: fixed technique, determinism, title contrast and the **safe zone**: characters, objects and text inside x 80–1000, y 160–1600 (the same margin on both sides), because TikTok/Reels/Shorts cover the top, the bottom and the edges with their interface (only backgrounds fill the whole frame). Check the types with `npm run typecheck` and fix it until there are no errors.
6. **Storyboard:** `node core/storyboard.ts videos/<topic>`. Look at `storyboard.png` yourself, fix whatever looks wrong (cuts, objects out of frame or in the red zones, unreadable text) and then **show it to me and wait for my approval** panel by panel. Then run `node core/preview.ts videos/<topic>`: if the preview is already open (from the setup or another chat) it reloads with this video, and if not it opens it. Give me the link it prints so I can watch it moving with the audio.
7. **Render:** `node core/render.ts videos/<topic>`. If `report.md` has any FAIL, fix it and render again.
8. **Delivery:** the path to `final.mp4`, the report's numbers, what you fixed and what you couldn't verify (for example, you can't listen to the result).
```
