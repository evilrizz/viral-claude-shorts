# Setup prompt: 3D

The only thing you install yourself is Claude Code. Open Claude Code in any folder (your Desktop, for example), paste this prompt once and Claude does the rest: it installs the programs, downloads the project, makes you a basic 3D animation (no voice) as a test and opens it in a preview in your browser. When the preview plays, everything is ready.

---

```text
I want to set up the 3D style of the project https://github.com/hans1801/viral-claude-shorts on my computer (it turns the audio of a script into an animated short). I'm a beginner: do everything yourself and explain each step in one plain line, no jargon.

1. Check which system I'm on (macOS, Windows or Linux).
2. Check for Git, Node.js 22.18 or later, ffmpeg and Python 3.10 or later. Install whatever is missing (or update Node if it's older):
   - macOS: with Homebrew (`brew install git node ffmpeg python`). If Homebrew isn't there, its installer asks for the Mac's password and you can't type it: give me the exact command to paste into the Terminal app, warn me that the password doesn't show while I type it, and wait until I say "done". Then install the rest yourself.
   - Windows: with `winget install` (Git.Git, OpenJS.NodeJS.LTS, Gyan.FFmpeg, Python.Python.3.12).
   - Linux: with the package manager; if it asks for a password (sudo), give me the command and wait.
   Then check the versions again. If something you just installed doesn't show up, look for it in its install path before asking me to restart anything.
3. If this folder isn't the project already, download it here with `git clone https://github.com/hans1801/viral-claude-shorts.git` and work inside `viral-claude-shorts`. If I already have the project, run `git pull` so the 3D style is there.
4. Install the dependencies without bumping versions (they're pinned on purpose):
   - transcription: a `.venv` environment at the root with `faster-whisper` (`python3 -m venv .venv` and its `pip install faster-whisper`);
   - TypeScript checks: `npm install` at the root;
   - style: `npm install` inside `styles/3d`, and check that `npx hyperframes --version` says 0.8.166.
5. Make me a basic 3D animation with no voice (about 6 seconds) to test that everything works. First read `styles/3d/USAGE.md` and look at the example in `videos/aviones/` (`scenes.json` and `visuals3d.ts`). Then, in `videos/hello-3d/`:
   - write `scenes.json` with style `3d`, fps 30 and `"duration": 6`, and 2 scenes with short Spanish titles (for example "¡Todo listo!"). There is no voice, so instead of word indices every scene after the first gives its start in seconds with `"t0"`, and every key its moment with `"t"`;
   - write `visuals3d.ts` with `defineVisuals({ ... })`: cheerful and simple, inside the safe zone (x 80–1000, y 160–1600), with the library's low-poly pieces (for example a cube that drops onto the grass with a little bounce, trees, the plane among clouds);
   - validate it with `node core/scenes.ts videos/hello-3d` and `npm run typecheck`, fixing it until there are no errors;
   - make the storyboard with `node core/storyboard.ts videos/hello-3d`, look at `videos/hello-3d/storyboard.png` yourself, fix whatever looks wrong and show it to me.
6. Open the preview with `node core/preview.ts videos/hello-3d` (it opens my browser at http://localhost:3003).
7. If something fails, fix it without changing the style's technique and tell me what you changed.
8. Finish with this, in plain words:
   - what got installed and which folder the project is in;
   - **the preview:** my test animation is at http://localhost:3003, where I can play it and drag the timeline. It stays open in the background even if I close this chat, and it always shows the last video built (with my videos I'll hear their audio there too). To close it: `node core/preview.ts videos/hello-3d --stop`;
   - **next step:** have the script's audio ready (recorded or generated), open a NEW chat in Claude Code in the project folder, drag the audio in and say what I want, mentioning the style (for example "anima este audio en 3D, la idea es…"); the project already tells Claude the whole process. That chat will find the preview already open (or open it again if it's closed).
```
