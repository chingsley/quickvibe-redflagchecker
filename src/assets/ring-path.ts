/**
 * SVG path data for a perfect circle (the loader ring).
 *
 * Rendered in a 100×100 viewBox centered at (50, 50) with radius 30.
 * Composed of 4 cubic bezier segments using the standard kappa
 * approximation (0.5522847498) so it morphs cleanly with mic-path.ts.
 *
 * Command structure: M + 4×C + Z  (6 commands — matches mic-path.ts)
 */

/** Full SVG `d` attribute string for a circle ring. */
export const RING_PATH =
  'M 50,20 ' +
  'C 66.57,20 80,33.43 80,50 ' +
  'C 80,66.57 66.57,80 50,80 ' +
  'C 33.43,80 20,66.57 20,50 ' +
  'C 20,33.43 33.43,20 50,20 Z';
