# viral-claude-shorts

This repo turns the audio of a script (a narration: recorded or generated) into an animated 9:16 short, synced to what it says. The user may be a beginner: explain each step in one plain line, in the user's language, with no jargon.

## When the user gives you an audio

A short message is enough: "anima este audio", "make a video from this", a dragged-in file with an idea, etc. Treat it as the production prompt: read `prompts/production.md` and follow its steps exactly, filling its blanks from the message:

- **Audio:** the file they gave you. If there's none, ask for it (that's the only thing you can't infer).
- **Style:** `flat2d` (the only one installed) unless they ask for another one in `styles/`.
- **Idea:** what they said they want to get across. If they didn't say it, infer it from the transcription and tell them in one line.
- **Assets and notes:** only if they gave them.

Don't skip the storyboard approval: show it and wait for their OK before rendering. Then open (or reuse) the live preview with `node core/preview.ts videos/<topic>` and give them the link.

## If something is missing

If `node_modules`, `.venv` or a tool (Node 22.18+, ffmpeg, Python) is missing, the project isn't set up yet: tell the user and offer to run the steps in `prompts/setup-flat2d.md` first.
