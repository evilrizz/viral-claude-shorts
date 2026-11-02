// The shapes shared by the whole pipeline: the JSON files in videos/<topic>/ and the interface every style implements.
// Types only: Node strips them when it runs the .ts files, so this file has no runtime code.

// words.json (written by transcribe.py)
export interface Word { w: string; t0: number; t1: number }
export interface Words { duration: number; language?: string; text?: string; words: Word[] }

// scenes.json (written by the agent, stamped with t0/t1/t by scenes.ts)
export type SceneType = 'question' | 'object' | 'process' | 'comparison' | 'stat' | 'map' | 'asset' | 'closing';
export interface Key { id: string; at?: number; t: number }   // at: word index (t in seconds when there's no voice)
export interface Scene {
  id: string;
  from?: number;   // word index where the scene starts (no voice: t0 in seconds instead)
  type: SceneType;
  label?: string;
  title?: string;
  highlight?: string;
  stat?: { value: string; text?: string };
  visual?: string;
  asset?: string;
  keys?: Key[];
  transition?: 'cut';
  t0: number;
  t1: number;
}
export interface Plan { style: string; fps: number; format: string; notes?: string; duration: number; scenes: Scene[] }

// script.json (only when the voice is generated with voice.ts)
export interface ScriptLine { id?: string; text: string; pause?: number; seed?: number }
export interface Script { language?: string; lead?: number; tail?: number; seed?: number; lines: ScriptLine[] }

// styles/<style>/adapter.ts
export interface Adapter {
  engine: string;
  build(video: string): string;                                            // writes the style's project for this video
  frames(video: string, times: number[], dir: string): Promise<string[]>;  // one PNG per time (storyboard)
  video(video: string): string | Promise<string>;                          // the silent MP4
  texts?(video: string): boolean | null | Promise<boolean | null>;         // text check: true, false or null (not measured)
  preview?(video: string): { url: string; started: boolean } | Promise<{ url: string; started: boolean }>;   // live preview: reuse or start
  stopPreview?(): void;
}
