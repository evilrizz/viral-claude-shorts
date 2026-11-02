#!/usr/bin/env python3
"""Pipeline step 1: the audio -> every word with its timing (faster-whisper, local, multilingual).
   usage: .venv/bin/python core/transcribe.py videos/<topic> [--model small] [--language es]
   reads  videos/<topic>/audio.wav (or audio.mp3 / audio.m4a)
   writes videos/<topic>/words.json: { duration, language, text, words: [{ w, t0, t1 }] }
   If script.json exists, its text is passed to the recognizer as a hint (better spelling of names and numbers)."""
import json
import os
import subprocess
import sys


def main():
    args = sys.argv[1:]
    def opt(k, d):
        if k in args:
            i = args.index(k); v = args[i + 1]; del args[i:i + 2]; return v
        return d
    model, language = opt('--model', 'small'), opt('--language', 'es')
    if not args:
        print(__doc__); sys.exit(2)
    root = args[0]
    audio = next((os.path.join(root, f) for f in ('audio.wav', 'audio.mp3', 'audio.m4a') if os.path.exists(os.path.join(root, f))), None)
    if not audio:
        print('no audio.wav / audio.mp3 / audio.m4a in', root); sys.exit(1)
    hint = None
    sp = os.path.join(root, 'script.json')
    if os.path.exists(sp):
        hint = ' '.join(l['text'] for l in json.load(open(sp, encoding='utf-8'))['lines'])
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio],
                               capture_output=True, text=True).stdout.strip())
    # decode with ffmpeg (16 kHz mono) instead of PyAV: avoids av version clashes
    import numpy as np
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True).stdout
    pcm = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    from faster_whisper import WhisperModel
    m = WhisperModel(model, device='cpu', compute_type='int8')
    segs, _ = m.transcribe(pcm, language=language, word_timestamps=True, beam_size=5, vad_filter=False,
                           initial_prompt=hint)
    words = []
    for s in segs:
        for w in s.words or []:
            t = w.word.strip()
            if t:
                words.append({'w': t, 't0': round(w.start, 3), 't1': round(w.end, 3)})
    out = {'duration': round(dur, 3), 'language': language, 'text': ' '.join(p['w'] for p in words), 'words': words}
    with open(os.path.join(root, 'words.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f'words.json: {len(words)} words, {dur:.2f} s (model {model}, language {language})')


if __name__ == '__main__':
    main()
