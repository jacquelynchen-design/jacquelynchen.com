'use client';
import { useEffect, useRef } from 'react';

// "Complexity" builds in from top to bottom as tiny ASCII characters that fill the
// letter shapes, then settles into the solid word. "into Clarity" stays static.
// Skipped entirely for visitors who prefer reduced motion.
const RAMP = ' .:-=+*#%@';
const CELL_W = 4;      // css px per ASCII column
const CELL_H = 6;      // css px per ASCII row
const SWEEP = 1300;    // ms for the reveal to travel top → bottom
const SETTLE = 650;    // ms for the ASCII to hand over to the solid word
const BAND = 46;       // css px of "live", flickering characters behind the reveal edge

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

   // Letter mask at css-pixel resolution.
   const mask = document.createElement('canvas'); mask.width = w; mask.height = h;
   const m = mask.getContext('2d', { willReadFrequently: true })!;
   m.font = font; m.textBaseline = 'alphabetic'; m.fillStyle = '#000';
   if ('letterSpacing' in m) (m as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
   const ascent = m.measureText('Complexity').fontBoundingBoxAscent;
   m.fillText(text.textContent ?? '', pad, pad + ascent);
   const data = m.getImageData(0, 0, w, h).data;

   // One cell per ASCII character; coverage = share of the cell inside the letters.
   const cols = Math.ceil(w / CELL_W), rows = Math.ceil(h / CELL_H);
   const cells: { x: number; y: number; cover: number; seed: number }[] = [];
   for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let hit = 0, total = 0;
    for (let yy = r * CELL_H; yy < Math.min(h, (r + 1) * CELL_H); yy += 2)
     for (let xx = c * CELL_W; xx < Math.min(w, (c + 1) * CELL_W); xx += 2) { total++; if (data[(yy * w + xx) * 4 + 3] > 100) hit++; }
    const cover = total ? hit / total : 0;
    if (cover > 0.08) cells.push({ x: c * CELL_W, y: r * CELL_H, cover, seed: Math.random() });
   }

   canvas.width = w * dpr; canvas.height = h * dpr;
   canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
   canvas.style.left = `${glyphs.left - host.left - pad}px`;
   canvas.style.top = `${glyphs.top - host.top - pad}px`;
   const ctx = canvas.getContext('2d')!;
   ctx.scale(dpr, dpr);
   ctx.font = `500 ${CELL_H + 1}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
   ctx.textBaseline = 'top';
   ctx.fillStyle = style.getPropertyValue('--ink') || getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#1700c4';
   canvas.style.opacity = '1';

   const start = performance.now();
   const draw = (now: number) => {
    const t = now - start;
    const edge = (t / SWEEP) * (h + BAND);         // reveal line, css px from top
    ctx.clearRect(0, 0, w, h);
    for (const cell of cells) {
     const age = edge - cell.y;                    // how long ago the edge passed
     if (age < 0) continue;
     const live = age < BAND;                      // near the edge: flicker
     const level = live ? cell.cover * (0.35 + 0.65 * Math.random()) : cell.cover;
     const jitter = live ? Math.random() : cell.seed;
     const idx = Math.max(1, Math.min(RAMP.length - 1, Math.round(level * (RAMP.length - 1) + (jitter - 0.5) * 2)));
     ctx.globalAlpha = live ? 0.45 + 0.55 * (age / BAND) : 1;
     ctx.fillText(RAMP[idx], cell.x, cell.y);
    }
    if (t < SWEEP) { frame = requestAnimationFrame(draw); return; }
    word.classList.add('is-solid');                 // solid word fades in (CSS)
    canvas.style.transition = `opacity ${SETTLE}ms ease`;
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
