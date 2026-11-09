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

Make it in ONE go, without stopping to ask me: the world test and the storyboard are your own working tools, so check them yourself and fix whatever looks wrong. Stop only if the audio is missing or something fails that you can't solve. I'll ask for changes when I see the result.

The order matters: first you design and test the video's **world** (everything it needs, built once), and only then you cut the audio into scenes that use it. That way every scene draws from the same tested pieces and the video looks like one piece.

1. **Read** `styles/<style>/USAGE.md` and look at that style's example videos to copy how they work (`flat2d`: `videos/blue-sky/`; `3d`: `videos/aviones/` and `videos/detail-demo/`, the second one for mixing simple and textured objects in one shared set).
2. **Transcribe and analyze:**
   - `.venv/bin/python core/transcribe.py videos/<topic>` (it assumes Spanish; for another language add `--language <code>`)
   - `node core/analyze.ts videos/<topic>`

   Read the whole transcription and the idea before anything else. The phrase table with every word's `#` index will be your clock later.
3. **Design the world** in `videos/<topic>/plan.md`. Go through the narration from start to end and write down everything the video needs to tell it:
   - **Cast:** every character and object the narration needs, described once and with precision: what it's for in the story, its parts, its proportions (compared with something everyone knows), its colors and materials. In `3d`, whether it's **textured** (the hero of its scenes) or **simple** (secondary and background). Give every figure that moves a real structure, not a doll: a skeleton of joints where the body bends (for a person: neck, shoulders, elbows, wrists, waist, hips, knees and ankles; for an animal or a machine, its own), each part shaped like what it is (limbs that taper, a chest wider than the waist, hands and feet with their own shape) and the joints visible where they help the pose read. Check that every joint bends the right way and within a natural range in every state.
   - **States:** for each one, every way it has to look or behave during the video (poses, movements, expressions, changes of color, size or shape, parts that light up, appear or hide), each with a short name, and how it goes from one state to another (instantly, or with a transition of how long).
   - **Characters from existing works:** when the narration is about a character from a series, a movie, a game, a comic or a brand, don't draw it, not even a simple or "similar" version: what makes it recognizable (its outfit, its colors, its hair, its symbols) belongs to its owners, however basic the drawing. Design an original character of the same genre instead, with its own look and palette, and take only generic things from the original, like a pose or a way of moving. Check that your character doesn't end up resembling another existing one by accident. The narration and the titles can still name the original. Say it in one line of the delivery.
   - **Sets:** every place where something happens: what's close and what's far, the light, the palette, and what moves on its own (ambient motion, always looping). If the whole video happens in one place, it's one set shared by every scene (in `3d`, `p3Stage`).
   - **Camera:** the shots the video will use, each with a name: where the camera stands, what it frames, how it moves and how fast. Every subject inside the safe zone (below). In `flat2d`, the compositions and how the frame moves.
   - **Visual language:** the effects and graphics that repeat (marks of motion, arrows, highlights, counters, labels): how each one looks and how long it takes, so they mean the same thing every time they appear.
   - **Sound:** the soundtrack is part of the world, and it follows the story's emotions just like the pictures do. Read the narration as a curve of feeling (where it's light, where it gets tense, where it surprises, where it lands) and write down: the tempo and the key of the whole video (`music` in `scenes.json`: one tempo for everything, so the cuts don't stumble); which mood each part of the story has (the moods and what each one is for are in `core/score.ts`); the background sound of each set (`ambience`); and the sound of each recurring effect of the visual language (`sfx`), so the same thing always sounds the same.
4. **Build and test the world**, before there are any scenes:
   - Write it in `videos/<topic>/world3d.ts` (`3d`) or `videos/<topic>/world.ts` (`flat2d`): one function per character or object that returns the piece and lets you pose any of its states at any time; one function per set; and the camera shots and effects as reusable helpers. The style's rules apply: everything posed from the time `t` (no randomness, no clocks, nothing that accumulates frame to frame) and the safe zone. Start every name with a short prefix of the topic: the world files of every video share one global scope in the type check.
   - In the same file, add test shots with `defineVisuals` (ids starting with `test-`), and list them in `videos/<topic>/world.json`: one shot per character or object that goes through **all** its states (with a `snap` at each one), one per set with its ambient motion, one per camera shot and one per effect. The format is at the top of `core/world.ts`.
   - Run `node core/world.ts videos/<topic>` and look at `world.png` panel by panel: each state reads clearly and matches `plan.md`, the transitions don't jump, the proportions hold from every angle, nothing falls out of the safe zone and no original character resembles an existing one. Fix the world (and `plan.md` if the design changed) and run it again until every panel is right. `npm run typecheck` must have no errors.
5. **Cut the audio into scenes** in `videos/<topic>/scenes.json`:
   - one scene per idea, 2 to 7 s long, each starting at the word (`from`) where that idea begins. The cut lands in the pause before it. Short connectors can stay as the tail of the previous scene to give it air;
   - **no animation left half done:** no key closer than 0.7 s to the end of its scene (the validator flags it as an ERROR), and every key-triggered change lasts 0.5 s at most. Anything continuous loops;
   - `type`: question, object, process, comparison, stat, map, asset or closing;
   - `title`: 40 characters at most, in the language of the audio, and `highlight` must be a word of the title that **is said** in that scene (so it lights up right when it's said);
   - `stat` only when there's a real number; numbers and claims must be verifiable;
   - `keys`: the moments the animation has to react to (`at` = word index);
   - `visual`: which pieces of the world the scene uses: characters and their states, the set, the camera shot and the effects. If a scene needs something the world doesn't have, add it to the world and test it first (step 4);
   - `mood`: the emotion of what is said in that scene, from `core/score.ts`. Follow the curve you designed: neighbouring scenes with different energy get a riser or a drop at the cut on their own, and a stat gets a silence and a hit, so contrast is what makes the music move. A whole video in the same mood sounds flat;
   - `ambience`: the background sound of the scene's set, if it has one;
   - `sfx` on the keys that deserve a sound (one or two per scene at most, on the moments the eye should catch): it sounds exactly at that word. Not every key needs one: too many sounds cover the voice.

   Validate with `node core/scenes.ts videos/<topic>` and fix it until there are no errors.
6. **Animate the scenes** with `defineVisuals({ ... })` in `videos/<topic>/visuals3d.ts` (`3d`) or `videos/<topic>/visuals.ts` (`flat2d`): each scene only assembles the world, following its `visual`: it places the pieces in their set, switches their states at its keys (`w.K('key')` in 3D, `K('key')` in flat2d) and runs its camera shot over the scene's time. New pieces don't go here: they go in the world. Keep the style's rules: fixed technique, determinism, title contrast and the **safe zone**: characters, objects and text inside x 80–1000, y 160–1600 (the same margin on both sides), because TikTok/Reels/Shorts cover the top, the bottom and the edges with their interface (only backgrounds fill the whole frame). `npm run typecheck` must have no errors.
7. **Storyboard:** `node core/storyboard.ts videos/<topic>`. Look at `storyboard.png` yourself, fix whatever looks wrong (cuts, objects out of frame or in the red zones, unreadable text, anything that doesn't match `plan.md`) and build it again until every panel is right. Don't wait for me: go on.
8. **Render:** `node core/render.ts videos/<topic>`. It synthesizes the soundtrack from the scenes (`core/music.ts`) and prints the score scene by scene: check it matches the curve you designed (moods, transitions, effects) and fix `scenes.json` if not. If `report.md` has any FAIL, fix it and render again. Then run `node core/preview.ts videos/<topic>`: if the preview is already open (from the setup or another chat) it reloads with this video, and if not it opens it.
9. **Delivery**, in plain words: the path to `final.mp4`, the link the preview printed (to watch it with the audio), the storyboard (`storyboard.png`, numbered panels), the idea you understood in one line, the emotional curve of the music in one line, the report's numbers, what you fixed and what you couldn't verify (for example, you can't listen to the result). End by telling me I can ask for changes by panel number.
```
