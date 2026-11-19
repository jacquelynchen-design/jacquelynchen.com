'use client';
import { useEffect, useRef } from 'react';

// "Complexity" assembles from ASCII pieces (test, 2026-11-19).
// A subtle grid sits behind the word and fades out towards its edges. Each grid cell the
// letters cover becomes a "piece": a tinted square carrying an ASCII glyph whose density
// follows how much ink the cell holds. Pieces start as small dots a short distance from
// their cell, drift in and grow into squares (the reverse of a word bursting into dots).
// Once every piece has landed, the pieces shrink step by step (each step 0.8× the last,
// glyphs included while they're still legible) while the blues settle into the heading
// colour and the grid fades away. The last step is the letterforms themselves, so the
// hand-over to the real text is invisible.
// "into Clarity" stays static. Visitors who prefer reduced motion get the final state.

const PALETTE = ['#A2A6D9', '#747BCD', '#4A52C7', '#1400BD'];  // light → deep, from Jac's swatches
const GLYPHS = ' .:-+xzZ%X#';                                  // sparse → dense
const FLIGHT = 720;     // ms for one piece to drift in
const STAGGER = 950;    // ms over which pieces set off
const SHRINK_MS = 700;  // ms for the whole shrink, eased in and out across the steps
const SHRINK = 0.8;     // scale of each step's pieces vs the previous one (20% smaller)
const GRID_IN = 600;    // ms for the grid to fade in

const easeOut = (x: number) => 1 - (1 - x) ** 2;   // soft landing without a long, still-looking tail
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2);
const hex = (h: string) => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
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

   // Shrink levels after the landed pieces: each 0.8× the last, down to 1 device px.
   const levels: number[] = [];
   for (let sz = cell * SHRINK; sz > 1.5; sz *= SHRINK) { const v = Math.round(sz); if (v !== levels[levels.length - 1]) levels.push(v); }
   levels.push(1);
   const blues = PALETTE.map(hex);
   const glyphLevels = levels.filter(sz => sz / dpr >= 5).length;
   const monoFont = (sz: number) => `500 ${Math.round(sz * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;

   // Each shrink level is rendered once, in the blue palette, into its own layer. Level 0 is
   // the landed pieces exactly as they end their flight. Frames cross-fade neighbouring
   // layers, so the shrink flows continuously instead of jumping from one size to the next.
   const renderLevel = (i: number) => {
    const layer = document.createElement('canvas'); layer.width = W; layer.height = H;
    const l = layer.getContext('2d')!;
    if (i === 0) {
     l.font = monoFont(cell); l.textAlign = 'center'; l.textBaseline = 'middle';
     for (const p of pieces) {
      const tone = shade(p.cov);
      l.globalAlpha = 1; l.fillStyle = PALETTE[tone]; l.fillRect(p.x, p.y, cell, cell);
      l.globalAlpha = 0.85; l.fillStyle = tone >= 2 ? '#fff' : PALETTE[3];
      l.fillText(p.glyph, p.x + cell / 2, p.y + cell / 2 + cell * 0.04);
     }
     return layer;
    }
    const sz = levels[i - 1];
    if (sz / dpr >= 5) {
     // Big enough to carry a glyph: squares plus characters that fade out level by level.
     l.font = monoFont(sz); l.textAlign = 'center'; l.textBaseline = 'middle';
     const glyphAlpha = 0.85 * (1 - i / (glyphLevels + 1));
     for (let y = 0; y < H; y += sz) for (let x = 0; x < W; x += sz) {
      const cov = coverage(x, y, sz);
      if (cov <= 0.02) continue;
      const tone = shade(cov);
      l.globalAlpha = Math.min(1, cov * 1.15); l.fillStyle = PALETTE[tone]; l.fillRect(x, y, sz, sz);
      if (cov < 0.1) continue;
      l.globalAlpha = glyphAlpha; l.fillStyle = tone >= 2 ? '#fff' : PALETTE[3];
      l.fillText(glyphFor(cov), x + sz / 2, y + sz / 2 + sz * 0.04);
     }
     return layer;
    }
    // Small blocks: written straight into pixels. The 1px level is the letter mask itself.
    const img = l.createImageData(W, H), d = img.data;
    const bcols = Math.ceil(W / sz), brows = Math.ceil(H / sz);
    const bc = new Float32Array(bcols * brows);
    for (let by = 0; by < brows; by++) for (let bx = 0; bx < bcols; bx++) bc[by * bcols + bx] = coverage(bx * sz, by * sz, sz);
    for (let y = 0; y < H; y++) {
     const row = ((y / sz) | 0) * bcols;
     for (let x = 0; x < W; x++) {
      const cov = bc[row + ((x / sz) | 0)];
      if (cov <= 0.02 && sz > 1) continue;
      const c = blues[shade(cov)], o = (y * W + x) * 4;
      d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2];
      d[o + 3] = Math.round(255 * (sz === 1 ? cov : Math.min(1, cov * 1.15)));
     }
    }
    l.putImageData(img, 0, 0);
    return layer;
   };
   const cache = new Map<number, HTMLCanvasElement>();
   const layerAt = (i: number) => {
    let c = cache.get(i);
    if (!c) { c = renderLevel(i); cache.set(i, c); }
    return c;
   };
   const mixed = document.createElement('canvas'); mixed.width = W; mixed.height = H;
   const mx = mixed.getContext('2d')!;

   // Colours. Ink is re-read each frame, since the light/dark theme can settle after start.
   const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true })!;
   const toRgb = (c: string) => { probe.clearRect(0, 0, 1, 1); probe.fillStyle = c; probe.fillRect(0, 0, 1, 1); return Array.from(probe.getImageData(0, 0, 1, 1).data.slice(0, 3)); };
   const inkNow = () => toRgb(getComputedStyle(word.closest('h1') ?? document.body).color);

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
   const finish = () => { cache.clear(); ctx.clearRect(0, 0, W, H); canvas.style.opacity = '0'; word.classList.add('is-solid'); };
   if (reduced) { finish(); return; }
   canvas.style.opacity = '1';

   const glyphFont = `500 ${Math.round(cell * 0.72)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
   const landAll = STAGGER + FLIGHT;
   const start = performance.now();
   const draw = (now: number) => {
    const t = now - start;
    const ink = syncGrid();
    ctx.clearRect(0, 0, W, H);
    const shrinkT = t - landAll;   // the shrink starts the moment the last piece lands
    if (shrinkT >= SHRINK_MS) { finish(); return; }
    const sp = shrinkT < 0 ? 0 : easeInOut(shrinkT / SHRINK_MS);              // eased shrink progress
    const step = shrinkT < 0 ? -1 : 0;
    // Grid fades in at the start and fades away while the pieces shrink, gone on the last frame.
    const gridOut = 1 - sp;
    ctx.globalAlpha = Math.min(1, t / GRID_IN) * gridOut; ctx.drawImage(grid, 0, 0); ctx.globalAlpha = 1;

    // Render the shrink layers ahead of time, one per frame while the pieces fly in, so the
    // shrink never stalls on a frame that has to build a layer.
    if (step < 0) for (let i = 0; i <= levels.length; i++) if (!cache.has(i)) { layerAt(i); break; }
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
     // Shrinking pieces: cross-fade the two nearest levels ('lighter' adds them, which is an
     // exact linear blend), then tint everything towards the heading colour.
     const u = sp * levels.length, i = Math.min(levels.length - 1, Math.floor(u)), f = u - i;
     mx.globalCompositeOperation = 'source-over'; mx.globalAlpha = 1; mx.clearRect(0, 0, W, H);
     mx.globalCompositeOperation = 'lighter';
     mx.globalAlpha = 1 - f; mx.drawImage(layerAt(i), 0, 0);
     if (f > 0) { mx.globalAlpha = f; mx.drawImage(layerAt(i + 1), 0, 0); }
     mx.globalCompositeOperation = 'source-atop'; mx.globalAlpha = sp; mx.fillStyle = rgb(ink); mx.fillRect(0, 0, W, H);
     ctx.drawImage(mixed, 0, 0);
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
