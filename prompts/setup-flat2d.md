# Setup prompt: Flat 2D

The only thing you install yourself is Claude Code. Open Claude Code in any folder (your Desktop, for example), paste this prompt once and Claude does the rest: it installs the programs, downloads the project, makes you a basic 2D animation (no voice) as a test and opens it in a preview in your browser. When the preview plays, everything is ready.

---

```text
I want to set up the project https://github.com/hans1801/viral-claude-shorts on my computer (it turns the audio of a script into an animated short, Flat 2D style). I'm a beginner: do everything yourself and explain each step in one plain line, no jargon.

1. Check which system I'm on (macOS, Windows or Linux).
2. Check for Git, Node.js 22.18 or later, ffmpeg and Python 3.10 to 3.14 (3.12 is the safest; newer ones, like 3.15, can't install the transcription yet). Install whatever is missing (or update Node if it's older):
   - macOS: with Homebrew (`brew install git node ffmpeg python@3.12`). If Homebrew isn't there, its installer asks for the Mac's password and you can't type it: give me the exact command to paste into the Terminal app, warn me that the password doesn't show while I type it, and wait until I say "done". Then install the rest yourself.
   - Windows: with `winget install` (Git.Git, OpenJS.NodeJS.LTS, Gyan.FFmpeg, Python.Python.3.12).
   - Linux: with the package manager; if it asks for a password (sudo), give me the command and wait.
   Then check the versions again. If something you just installed doesn't show up, look for it in its install path before asking me to restart anything.
3. If this folder isn't the project already, download it here with `git clone https://github.com/hans1801/viral-claude-shorts.git` and work inside `viral-claude-shorts`.
4. Install the dependencies without bumping versions (they're pinned on purpose):
   - transcription: a `.venv` environment at the root with `faster-whisper`, made with a Python from 3.10 to 3.14: `python3 -m venv .venv` if `python3 --version` is in that range, otherwise `python3.12 -m venv .venv` (on Windows `py -3.12 -m venv .venv`); then its `pip install faster-whisper`;
   - TypeScript checks: `npm install` at the root;
   - style: `npm install` inside `styles/flat2d`, and check that `npx hyperframes --version` says 0.8.166.
5. Make me a basic 2D animation with no voice (about 6 seconds) to test that everything works. First read `styles/flat2d/USAGE.md` and look at the example in `videos/blue-sky/` (`scenes.json` and `visuals.ts`). Then, in `videos/hello/`:
   - write `scenes.json` with style `flat2d`, fps 30 and `"duration": 6`, and 2 or 3 scenes with short Spanish titles (for example "¡Todo listo!"). There is no voice, so instead of word indices every scene after the first gives its start in seconds with `"t0"`, and every key its moment with `"t"`;
   - write `visuals.ts` with `defineVisuals({ ... })`: cheerful and simple, inside the safe zone (x 80–1000, y 160–1600), with the library's flat pieces (for example a check mark that pops in, the sun, confetti made of flat shapes);
   - validate it with `node core/scenes.ts videos/hello` and `npm run typecheck`, fixing it until there are no errors;
   - make the storyboard with `node core/storyboard.ts videos/hello`, look at `videos/hello/storyboard.png` yourself, fix whatever looks wrong and show it to me.
6. Open the preview with `node core/preview.ts videos/hello` (it opens my browser at http://localhost:3002).
7. If something fails, fix it without changing the style's technique and tell me what you changed.
8. Finish with this, in plain words:
   - what got installed and which folder the project is in;
   - **the preview:** my test animation is at http://localhost:3002, where I can play it and drag the timeline. It stays open in the background even if I close this chat, and it always shows the last video built (with my videos I'll hear their audio there too). To close it: `node core/preview.ts videos/hello --stop`;
   - **next step:** have the script's audio ready (recorded or generated), open a NEW chat in Claude Code in the project folder, drag the audio in and say what I want (for example "anima este audio, la idea es…"); the project already tells Claude the whole process. That chat will find the preview already open (or open it again if it's closed).
```
