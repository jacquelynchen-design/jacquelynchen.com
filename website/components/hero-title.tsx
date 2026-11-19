'use client';
import { useEffect, useRef } from 'react';

// "Complexity" builds up as a 1-bit ordered (Bayer) dither: a soft density gradient
// rises from the base of the letters until the word is fully dense, then the dither
// grid refines step by step (3px → 2 → 1.5 → 1 → 0.5) until the last step is the
// letterforms themselves, so the hand-over to the real text is invisible.
// "into Clarity" stays static. Skipped for visitors who prefer reduced motion.
const BAYER = [
 0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26,
 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22,
 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25,
 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
].map(v => (v + 0.5) / 64);
const LEVELS = [3, 2, 1.5, 1, 0.5]; // css px per dither dot, coarse → fine
const FILL = 1800;     // ms for the density to rise from the base to the top
const BAND = 1;        // height of the soft density gradient, as a share of the word
const STEP = 140;      // ms per refinement step once the word is fully dense
const ease = (x: number) => 1 - (1 - x) ** 1.6;   // gentle ease-out

export function HeroTitle() {
 const wordRef = useRef<HTMLSpanElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
  const word = wordRef.current, canvas = canvasRef.current;
  if (!word || !canvas) return;
  const done = () => { word.classList.add('is-solid'); canvas.style.opacity = '0'; };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { done(); return; }

  let frame = 0, cancelled = false;
  const run = async () => {
   await document.fonts.ready;
   if (cancelled) return;
   const text = word.firstChild;
   if (!text) return done();
   const range = document.createRange(); range.selectNodeContents(text);
   const glyphs = range.getBoundingClientRect();
   const host = word.parentElement!.getBoundingClientRect();
   const style = getComputedStyle(word);
   const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   const pad = 12;
   const w = Math.ceil(glyphs.width + pad * 2), h = Math.ceil(glyphs.height + pad * 2);
   const dpr = Math.min(window.devicePixelRatio || 1, 2);

   // Letter mask at device-pixel resolution; alpha = how much of each pixel is ink.
   const W = Math.round(w * dpr), H = Math.round(h * dpr);
   const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
   const m = mask.getContext('2d', { willReadFrequently: true })!;
   m.scale(dpr, dpr);
   m.font = font; m.textBaseline = 'alphabetic'; m.fillStyle = '#000';
   if ('letterSpacing' in m) (m as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
   const ascent = m.measureText('Complexity').fontBoundingBoxAscent;
   m.fillText(text.textContent ?? '', pad, pad + ascent);
   const src = m.getImageData(0, 0, W, H).data;
   const alpha = new Float32Array(W * H);
   for (let i = 0; i < alpha.length; i++) alpha[i] = src[i * 4 + 3] / 255;

   // Coverage per dither dot, for each grid size.
   const sizes = [...new Set(LEVELS.map(l => Math.max(1, Math.round(l * dpr))))];
   if (sizes[sizes.length - 1] !== 1) sizes.push(1);
   const grids = sizes.map(sz => {
    const cols = Math.ceil(W / sz), rows = Math.ceil(H / sz), cov = new Float32Array(cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
     let sum = 0, n = 0;
     for (let y = r * sz; y < Math.min(H, (r + 1) * sz); y++) for (let x = c * sz; x < Math.min(W, (c + 1) * sz); x++) { sum += alpha[y * W + x]; n++; }
     cov[r * cols + c] = sum / n;
    }
    return { sz, cols, rows, cov };
   });

   canvas.width = W; canvas.height = H;
   canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
   canvas.style.left = `${glyphs.left - host.left - pad}px`;
   canvas.style.top = `${glyphs.top - host.top - pad}px`;
   const ctx = canvas.getContext('2d')!;
   const out = ctx.createImageData(W, H), px = out.data;
   // Ink = the heading colour (the word itself is transparent until handed over). Re-read
   // each frame, since the light/dark theme can settle after the animation starts.
   const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
   let inkColor = '';
   const syncInk = () => {
    const c = getComputedStyle(word.closest('h1') ?? document.body).color;
    if (c === inkColor) return; inkColor = c;
    probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1);
    const [R, G, B] = probe.getImageData(0, 0, 1, 1).data;
    for (let i = 0; i < px.length; i += 4) { px[i] = R; px[i + 1] = G; px[i + 2] = B; }
   };
   canvas.style.opacity = '1';

   const start = performance.now();
   const draw = (now: number) => {
    const t = now - start;
    const p = ease(Math.min(1, t / FILL));
    const step = t < FILL ? 0 : Math.floor((t - FILL) / STEP) + 1;
    const last = step >= grids.length - 1;
    syncInk();
    for (let i = 3; i < px.length; i += 4) px[i] = 0;
    if (last) {
     for (let i = 0; i < alpha.length; i++) px[i * 4 + 3] = Math.round(alpha[i] * 255);   // the letterforms themselves
    } else {
     const { sz, cols, rows, cov } = grids[step];
     for (let r = 0; r < rows; r++) {
      const fromBase = 1 - ((r + 0.5) * sz) / H;                              // 0 at the base, 1 at the top
      const d = Math.max(0, Math.min(1, (p * (1 + BAND) - fromBase) / BAND));  // density at this height
      if (d <= 0) continue;
      for (let c = 0; c < cols; c++) {
       const v = cov[r * cols + c] * d;
       if (v <= BAYER[(r & 7) * 8 + (c & 7)]) continue;
       for (let y = r * sz; y < Math.min(H, (r + 1) * sz); y++)
        for (let x = c * sz, e = Math.min(W, (c + 1) * sz); x < e; x++) px[(y * W + x) * 4 + 3] = 255;
      }
     }
    }
    ctx.putImageData(out, 0, 0);
    if (!last) { frame = requestAnimationFrame(draw); return; }
    word.classList.add('is-solid');                                             // identical pixels: invisible hand-over
    canvas.style.opacity = '0';
   };
   frame = requestAnimationFrame(draw);
  };
  run().catch(done);
  return () => { cancelled = true; cancelAnimationFrame(frame); };
 }, []);

 return <h1 id="hero-title" lang="en" className="hero-title">
  <span className="hero-complexity-line"><span ref={wordRef} className="hero-complexity">Complexity</span><canvas ref={canvasRef} className="hero-ascii" aria-hidden="true" /></span>
  <span><em>into</em> Clarity</span>
 </h1>;
}
