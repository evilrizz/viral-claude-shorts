# viral-claude-shorts

This repo turns the audio of a script (a narration: recorded or generated) into an animated 9:16 short, synced to what it says. The user may be a beginner: explain each step in one plain line, in the user's language, with no jargon.

## When the user gives you an audio

A short message is enough: "anima este audio", "make a video from this", a dragged-in file with an idea, etc. Treat it as the production prompt: read `prompts/production.md` and follow its steps exactly, filling its blanks from the message:

- **Audio:** the file they gave you. If there's none, ask for it (that's the only thing you can't infer).
- **Style:** `flat2d` unless they ask for another one in `styles/` (for example `3d`). If they don't say and the topic has volume (machines, vehicles, physics), suggest `3d` in one line.
- **Idea:** what they said they want to get across. If they didn't say it, infer it from the transcription and tell them in one line.
- **Assets and notes:** only if they gave them.

Make it in one go: design and test the video's world first (`plan.md`, the world file and `core/world.ts`: characters with their states, sets, camera shots), then cut the audio into scenes that use it. The world test and the storyboard are your own working tools, so check them yourself, fix what's wrong and don't stop to ask for approval. Characters from existing series, movies, games, comics or brands are never drawn, not even "similar" versions: design original ones of the same genre (step 3 of `prompts/production.md`). At the end, open (or reuse) the live preview with `node core/preview.ts videos/<topic>` and deliver `final.mp4`, the preview link and the storyboard; the user asks for changes by panel number.

## If something is missing

If `node_modules`, `.venv` or a tool (Node 22.18+, ffmpeg, Python 3.10 to 3.14) is missing, the project isn't set up yet: tell the user and offer to run the steps in `prompts/setup-<style>.md` first. The same goes for a style they ask for whose `styles/<style>/node_modules` is missing.
