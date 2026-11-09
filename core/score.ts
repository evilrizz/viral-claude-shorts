// The vocabulary of the soundtrack: what scenes.json can ask for (each scene's mood and ambience, each key's sound effect)
// and what each mood means musically. Read by core/music.ts (which synthesizes it) and core/scenes.ts (which validates it).
import type { SceneType } from './types.ts';

export type Wave = 'sine' | 'tri' | 'saw' | 'square';
// scales as semitones from the root
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11],
};
export interface Mood {
  about: string;                      // when to use it
  scale: keyof typeof SCALES;
  prog: number[];                     // one chord per bar, as scale degrees (0 = the root chord)
  energy: number;                     // 0..1: decides the transitions (rising -> riser + impact, falling -> drop)
  bright: number;                     // low-pass amount: 0.02 dark ... 0.2 bright
  pad: number; padWave: Wave;         // sustained chords
  bass: number; bassPerBar: number;   // bass notes per bar (0 = none)
  arp: number; arpVol: number; arpWave: Wave; arpOct: number;   // notes per beat (0 = none)
  drums: number; kick: string; snare: string; hat: string;      // 16 steps per bar ('x' = hit)
  drone: number; bells: number; dissonant?: boolean;
}
const no = '................';
export const MOODS: Record<string, Mood> = {
  calm:       { about: 'explaining, neutral, steady', scale: 'major', prog: [0, 4, 5, 3], energy: 0.3, bright: 0.05, pad: 0.14, padWave: 'tri', bass: 0.12, bassPerBar: 1, arp: 1, arpVol: 0.05, arpWave: 'sine', arpOct: 1, drums: 0, kick: no, snare: no, hat: no, drone: 0, bells: 0 },
  curious:    { about: 'a question, a mystery to solve, light intrigue', scale: 'dorian', prog: [0, 3, 1, 4], energy: 0.4, bright: 0.07, pad: 0.11, padWave: 'tri', bass: 0.1, bassPerBar: 2, arp: 2, arpVol: 0.06, arpWave: 'tri', arpOct: 1, drums: 0.35, kick: 'x.......x.......', snare: no, hat: '..x...x...x...x.', drone: 0, bells: 0.04 },
  playful:    { about: 'funny, ironic, light-hearted', scale: 'major', prog: [0, 3, 4, 0], energy: 0.55, bright: 0.12, pad: 0.08, padWave: 'square', bass: 0.14, bassPerBar: 4, arp: 2, arpVol: 0.07, arpWave: 'square', arpOct: 1, drums: 0.5, kick: 'x.....x.x.......', snare: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', drone: 0, bells: 0.03 },
  energetic:  { about: 'action, speed, movement, hype', scale: 'minor', prog: [0, 5, 2, 6], energy: 0.85, bright: 0.15, pad: 0.12, padWave: 'saw', bass: 0.18, bassPerBar: 8, arp: 4, arpVol: 0.05, arpWave: 'saw', arpOct: 1, drums: 0.8, kick: 'x...x...x...x...', snare: '....x.......x...', hat: 'xxxxxxxxxxxxxxxx', drone: 0, bells: 0 },
  epic:       { about: 'a big number, scale, importance, awe', scale: 'minor', prog: [0, 5, 3, 4], energy: 0.8, bright: 0.1, pad: 0.2, padWave: 'saw', bass: 0.18, bassPerBar: 2, arp: 1, arpVol: 0.05, arpWave: 'tri', arpOct: 2, drums: 0.7, kick: 'x..x..x.x...x...', snare: '........x.......', hat: no, drone: 0.08, bells: 0.06 },
  tense:      { about: 'something is wrong, a problem, suspense', scale: 'phrygian', prog: [0, 1, 0, 6], energy: 0.5, bright: 0.035, pad: 0.1, padWave: 'saw', bass: 0.12, bassPerBar: 4, arp: 0, arpVol: 0, arpWave: 'sine', arpOct: 1, drums: 0.45, kick: 'x.x.............', snare: no, hat: '....x.......x...', drone: 0.14, bells: 0 },
  dark:       { about: 'horror, fear, danger, death: sparse and low', scale: 'phrygian', prog: [0, 1], energy: 0.4, bright: 0.02, pad: 0.08, padWave: 'saw', bass: 0, bassPerBar: 0, arp: 0, arpVol: 0, arpWave: 'sine', arpOct: 1, drums: 0.3, kick: 'x...............', snare: no, hat: no, drone: 0.22, bells: 0.05, dissonant: true },
  sad:        { about: 'loss, regret, a melancholic fact', scale: 'minor', prog: [0, 5, 3, 4], energy: 0.25, bright: 0.045, pad: 0.14, padWave: 'sine', bass: 0.08, bassPerBar: 1, arp: 1, arpVol: 0.06, arpWave: 'sine', arpOct: 1, drums: 0, kick: no, snare: no, hat: no, drone: 0, bells: 0.03 },
  wonder:     { about: 'discovery, beauty, "how amazing"', scale: 'lydian', prog: [0, 1, 4, 0], energy: 0.35, bright: 0.09, pad: 0.12, padWave: 'tri', bass: 0.08, bassPerBar: 1, arp: 2, arpVol: 0.05, arpWave: 'sine', arpOct: 2, drums: 0, kick: no, snare: no, hat: no, drone: 0, bells: 0.07 },
  triumphant: { about: 'the ending, a win, a call to action', scale: 'major', prog: [0, 4, 5, 3], energy: 0.9, bright: 0.13, pad: 0.18, padWave: 'saw', bass: 0.16, bassPerBar: 4, arp: 2, arpVol: 0.05, arpWave: 'tri', arpOct: 1, drums: 0.7, kick: 'x...x...x...x...', snare: '....x.......x...', hat: '..x...x...x...x.', drone: 0, bells: 0.06 },
};
// a scene with no mood gets its type's
export const TYPE_MOOD: Record<SceneType, string> = { question: 'curious', object: 'calm', process: 'calm', comparison: 'curious', stat: 'epic', map: 'calm', asset: 'calm', closing: 'triumphant' };
// sound effects a key can trigger (at the key's moment)
export const SFX: Record<string, string> = {
  whoosh: 'something passes fast or appears with a movement', hit: 'a solid, short accent', impact: 'a big moment, a heavy landing',
  pop: 'something small appears or lights up', tick: 'a small click: a detail, a switch, a stop', riser: 'tension that grows into this moment (starts 1 s before)',
  shimmer: 'magic, insight, something shining', fail: 'a comic "wah-wah": a mistake or a letdown', scratch: 'a record scratch: a sudden stop or a twist',
  zip: 'a bullet or a laser flying by', thump: 'a soft low knock: a step, a drop, a heartbeat',
};
// background sound of a scene's place
export const AMBIENCE: Record<string, string> = { wind: 'open air', forest: 'trees and birds', crowd: 'many people', room: 'an indoor space', steps: 'running footsteps on the beat' };
