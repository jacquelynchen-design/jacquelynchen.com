'use client';
import { useEffect, useRef } from 'react';

// "Complexity" assembles from ASCII pieces (test, 2026-11-19).
// A subtle grid sits behind the word and fades out towards its edges. Each grid cell the
// letters cover becomes a "piece": a tinted square carrying an ASCII glyph whose density
// follows how much ink the cell holds. Pieces start as small dots a short distance from
// their cell, drift in and grow into squares (the reverse of a word bursting into dots).
// Once every piece has landed, the pieces shrink step by step (each step ~0.72× the last,
// glyphs included while they're still legible) while the blues settle into the heading
// colour and the grid fades away. The last step is the letterforms themselves, so the
// hand-over to the real text is invisible.
// "into Clarity" stays static. Visitors who prefer reduced motion get the final state.

const PALETTE = ['#A2A6D9', '#747BCD', '#4A52C7', '#1400BD'];  // light → deep, from Jac's swatches
const GLYPHS = ' .:-+xzZ%X#';                                  // sparse → dense
const FLIGHT = 720;     // ms for one piece to drift in
const STAGGER = 950;    // ms over which pieces set off
const HOLD = 260;       // ms with every piece landed before the refinement
const STEP = 95;        // ms per shrink step
const SHRINK = 0.72;    // scale of each step's pieces vs the previous one
const GRID_IN = 600;    // ms for the grid to fade in

const easeOut = (x: number) => 1 - (1 - x) ** 3;
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const rgb = (c: number[], a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const shade = (cov: number) => (cov > 0.85 ? 3 : cov > 0.6 ? 2 : cov > 0.35 ? 1 : 0);
const glyphFor = (cov: number) => GLYPHS[Math.max(1, Math.min(GLYPHS.length - 1, Math.round(cov * (GLYPHS.length - 1))))];

// Seeded random, so the composition is the same on every visit.
const rng = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

export function HeroTitle() {
 const wordRef = useRef<HTMLSpanElement>(null);
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
  const word = wordRef.current, canvas = canvasRef.current;
  if (!word || !canvas) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0, cancelled = false;

  const run = async () => {
   await document.fonts.ready;
   if (cancelled) return;
   const text = word.firstChild;
   if (!text) { word.classList.add('is-solid'); return; }
   const range = document.createRange(); range.selectNodeContents(text);
   const glyphs = range.getBoundingClientRect();
   const host = word.parentElement!.getBoundingClientRect();
   const style = getComputedStyle(word);
   const fontPx = parseFloat(style.fontSize);
   const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
   const dpr = Math.min(window.devicePixelRatio || 1, 2);

   // Grid geometry, in device pixels. The canvas reaches past the word so the grid has room to fade.
   const cell = Math.max(6, Math.round(fontPx / 11)) * dpr;
   const margin = Math.ceil((glyphs.height * 0.55 * dpr) / cell) * cell;
   const cols = Math.ceil((glyphs.width * dpr) / cell) + (2 * margin) / cell + 1;
   const rows = Math.ceil((glyphs.height * dpr) / cell) + (2 * margin) / cell + 1;
   const W = cols * cell, H = rows * cell;
   canvas.width = W; canvas.height = H;
   canvas.style.width = `${W / dpr}px`; canvas.style.height = `${H / dpr}px`;
   canvas.style.left = `${glyphs.left - host.left - margin / dpr}px`;
   canvas.style.top = `${glyphs.top - host.top - margin / dpr}px`;
   const ctx = canvas.getContext('2d')!;

   // Letter mask; alpha = how much of each device pixel is ink.
   const mask = document.createElement('canvas'); mask.width = W; mask.height = H;
   const m = mask.getContext('2d', { willReadFrequently: true })!;
   m.scale(dpr, dpr);
   m.font = font; m.textBaseline = 'alphabetic'; m.fillStyle = '#000';
   if ('letterSpacing' in m) (m as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
   const ascent = m.measureText('Complexity').fontBoundingBoxAscent;
   m.fillText(text.textContent ?? '', margin / dpr, margin / dpr + ascent);
   const src = m.getImageData(0, 0, W, H).data;

   // Summed-area table → ink coverage of any square in O(1).
   const sat = new Float64Array((W + 1) * (H + 1));
   for (let y = 0; y < H; y++) {
    let row = 0;
    for (let x = 0; x < W; x++) { row += src[(y * W + x) * 4 + 3] / 255; sat[(y + 1) * (W + 1) + x + 1] = sat[y * (W + 1) + x + 1] + row; }
   }
   const coverage = (x: number, y: number, s: number) => {
    const x1 = Math.min(W, x + s), y1 = Math.min(H, y + s);
    const sum = sat[y1 * (W + 1) + x1] - sat[y * (W + 1) + x1] - sat[y1 * (W + 1) + x] + sat[y * (W + 1) + x];
    return sum / ((x1 - x) * (y1 - y));
   };

   // Pieces: one per covered cell.
   const rand = rng(7);
   const cx0 = W / 2, cy0 = H / 2;
   const pieces: { x: number; y: number; sx: number; sy: number; cov: number; delay: number; glyph: string }[] = [];
   for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cov = coverage(c * cell, r * cell, cell);
    if (cov < 0.1) continue;
    const x = c * cell, y = r * cell;
    // Drift in from a short distance, roughly away from the middle of the word.
    const a = Math.atan2(y - cy0, (x - cx0) * 0.35) + (rand() - 0.5) * 2.2;
    const d = cell * (1.5 + rand() * 4.5);
    pieces.push({ x, y, sx: x + Math.cos(a) * d, sy: y + Math.sin(a) * d, cov, delay: rand() ** 1.4 * STAGGER, glyph: glyphFor(cov) });
   }

   // Shrink levels after the landed pieces: each ~0.72× the last, down to 1 device px.
   const levels: number[] = [];
   for (let sz = cell * SHRINK; sz > 1.5; sz *= SHRINK) { const v = Math.round(sz); if (v !== levels[levels.length - 1]) levels.push(v); }
   levels.push(1);
   const blocks = levels.map(s => {
    const list: { x: number; y: number; cov: number; glyph: string }[] = [];
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) { const cov = coverage(x, y, s); if (cov > 0.02) list.push({ x, y, cov, glyph: glyphFor(cov) }); }
    return { s, list, font: s / dpr >= 5 ? `500 ${Math.round(s * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace` : '' };
   });

   // Colours. Ink is re-read each frame, since the light/dark theme can settle after start.
   const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
   const toRgb = (c: string) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); return Array.from(probe.getImageData(0, 0, 1, 1).data.slice(0, 3)); };
   const inkNow = () => toRgb(getComputedStyle(word.closest('h1') ?? document.body).color);
   const blues = PALETTE.map(hex);

   // Grid lines, faded towards the edges with an elliptical gradient.
   const grid = document.createElement('canvas'); grid.width = W; grid.height = H;
   const g = grid.getContext('2d')!;
   const paintGrid = (ink: number[]) => {
    g.clearRect(0, 0, W, H);
    g.fillStyle = rgb(ink, 0.14);
    for (let c = 0; c <= cols; c++) g.fillRect(Math.min(W - 1, c * cell), 0, 1, H);
    for (let r = 0; r <= rows; r++) g.fillRect(0, Math.min(H - 1, r * cell), W, 1);
    g.save();
    g.globalCompositeOperation = 'destination-in';
    g.translate(W / 2, H / 2); g.scale(W / 2, H / 2);
    const fade = g.createRadialGradient(0, 0, 0, 0, 0, 1);
    fade.addColorStop(0, '#000'); fade.addColorStop(0.45, '#000'); fade.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = fade; g.fillRect(-1, -1, 2, 2);
    g.restore();
   };
   let gridInk = '';
   const syncGrid = () => { const ink = inkNow(); const k = ink.join(); if (k !== gridInk) { gridInk = k; paintGrid(ink); } return ink; };

   // Final state: the real text, with the grid fully faded out.
   const finish = () => { ctx.clearRect(0, 0, W, H); canvas.style.opacity = '0'; word.classList.add('is-solid'); };
   if (reduced) { finish(); return; }
   canvas.style.opacity = '1';

   const glyphFont = `500 ${Math.round(cell * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
   const landAll = STAGGER + FLIGHT;
   const start = performance.now();
   const draw = (now: number) => {
    const t = now - start;
    const ink = syncGrid();
    ctx.clearRect(0, 0, W, H);
    const shrinkT = t - landAll - HOLD;
    const step = shrinkT < 0 ? -1 : Math.floor(shrinkT / STEP);
    if (step >= blocks.length) { finish(); return; }
    // Grid fades in at the start and fades away while the pieces shrink, gone on the last frame.
    const gridOut = shrinkT < 0 ? 1 : 1 - Math.min(1, shrinkT / (blocks.length * STEP));
    ctx.globalAlpha = Math.min(1, t / GRID_IN) * gridOut; ctx.drawImage(grid, 0, 0); ctx.globalAlpha = 1;

    if (step < 0) {
     // Pieces drifting in.
     ctx.font = glyphFont; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
     for (const p of pieces) {
      const k = Math.min(1, Math.max(0, (t - p.delay) / FLIGHT));
      if (k <= 0) continue;
      const e = easeOut(k);
      const x = p.sx + (p.x - p.sx) * e, y = p.sy + (p.y - p.sy) * e;
      const size = cell * (0.3 + 0.7 * e);
      const off = (cell - size) / 2;
      const tone = shade(p.cov);
      ctx.globalAlpha = Math.min(1, k * 3);
      ctx.fillStyle = PALETTE[tone];
      ctx.beginPath();
      ctx.roundRect(x + off, y + off, size, size, (size / 2) * (1 - e));   // dot → square
      ctx.fill();
      if (e > 0.55) {
       // Glyphs flicker while the piece settles, then lock to their density.
       const ch = k < 1 ? GLYPHS[1 + Math.floor(Math.random() * (GLYPHS.length - 1))] : p.glyph;
       ctx.globalAlpha *= Math.min(1, (e - 0.55) / 0.3) * 0.85;
       ctx.fillStyle = tone >= 2 ? '#fff' : PALETTE[3];
       ctx.fillText(ch, x + cell / 2, y + cell / 2 + cell * 0.04);
      }
     }
     ctx.globalAlpha = 1;
    } else {
     // Shrinking pieces while the blues settle into the heading colour.
     const k = (step + 1) / blocks.length;
     const tones = blues.map(b => mix(b, ink, k));
     const { s, list, font: gf } = blocks[step];
     for (const b of list) { ctx.globalAlpha = s === 1 ? b.cov : Math.min(1, b.cov * 1.15); ctx.fillStyle = rgb(tones[shade(b.cov)]); ctx.fillRect(b.x, b.y, s, s); }
     if (gf) {
      ctx.font = gf; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (const b of list) {
       if (b.cov < 0.1) continue;
       const tone = shade(b.cov);
       ctx.globalAlpha = 0.85 * (1 - k);
       ctx.fillStyle = tone >= 2 ? '#fff' : rgb(tones[3]);
       ctx.fillText(b.glyph, b.x + s / 2, b.y + s / 2 + s * 0.04);
      }
     }
     ctx.globalAlpha = 1;
    }
    frame = requestAnimationFrame(draw);
   };
   frame = requestAnimationFrame(draw);
  };
  run().catch(() => word.classList.add('is-solid'));
  return () => { cancelled = true; cancelAnimationFrame(frame); };
 }, []);

 return <h1 id="hero-title" lang="en" className="hero-title">
  <span className="hero-complexity-line"><span ref={wordRef} className="hero-complexity">Complexity</span><canvas ref={canvasRef} className="hero-ascii" aria-hidden="true" /></span>
  <span><em>into</em> Clarity</span>
 </h1>;
}
