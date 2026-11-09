// What the browser files (engine.ts, library.ts and each video's visuals3d.ts) see as globals.
// SCENES and WORDS are written inline in project/index.html by the adapter; gsap and THREE come from their own scripts.
type Scene = import('../../core/types.ts').Scene;
declare const SCENES: import('../../core/types.ts').Plan;
declare const WORDS: import('../../core/types.ts').Word[];

type Vec3 = [number, number, number];

// what a scene builds its 3D with
interface World {
  s: Scene;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  present?: () => void;                                        // optional: draws the frame itself (for an image finish); otherwise the engine draws it
  add<T extends THREE.Object3D>(object: T): T;                 // puts a piece in the scene and returns it
  look(pos: Vec3, target: Vec3, fov?: number): void;           // places the camera; the target lands in the center of the frame (x 540), the center of the safe zone
  K(key: string, fallback?: number): number;                   // when the word of that key is said
  tl: gsap.core.Timeline;                                      // the video's timeline, for anything in HTML on top of the 3D
  titles: HTMLElement;                                         // this scene's titles layer
}
// a scene's art: background, and build(), which makes the pieces once and returns the function that poses them at time t.
// That function has to give the same picture for the same t, in any order: frames are captured out of order.
interface Visual {
  bg?: string;
  build(w: World): (t: number) => void;
}
