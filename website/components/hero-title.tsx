'use client';
import { useEffect, useRef } from 'react';

// "Complexity" fills like a glass of water: a continuous pour of tiny ASCII characters
// streams down through the letters from just above them, reaches the base, and the word
// fills from the bottom up; solid ink rises behind the ASCII until the word is whole.
// Characters are crisp and solid-coloured; they keep changing while they settle.
// "into Clarity" stays static. Skipped for visitors who prefer reduced motion.
const POUR_CHARS = '|:!;|:\'|';       // the falling stream
const FILL_CHARS = '#%@&$8*+=';      // the settled water
const CELL_W = 6;      // css px per ASCII column
const CELL_H = 9;      // css px per ASCII row (font size = CELL_H, so characters never overlap)
const TOP = 9;         // css px above the letters where the pour starts
const POUR = 700;      // ms for the pour to reach the base
const FILL = 2000;     // ms for the water level to rise from the base to the top
const LAG = 750;       // ms the solid ink trails the water level
const SOLID = 2000;    // ms for the solid ink to rise from the base to the top
const FLOW = 55;       // ms per row the stream moves down
const CHURN = 0.05;    // chance per frame a settled character changes

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
   const cells: { x: number; y: number; c: number; r: number; ch: string }[] = [];
   for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let hit = 0, total = 0;
    for (let yy = r * CELL_H; yy < Math.min(h, (r + 1) * CELL_H); yy += 2)
     for (let xx = c * CELL_W; xx < Math.min(w, (c + 1) * CELL_W); xx += 2) { total++; if (data[(yy * w + xx) * 4 + 3] > 100) hit++; }
    const cover = total ? hit / total : 0;
    if (cover > 0.2) cells.push({ x: c * CELL_W, y: r * CELL_H, c, r, ch: '' });
   }

   canvas.width = w * dpr; canvas.height = (h + TOP) * dpr;
   canvas.style.width = `${w}px`; canvas.style.height = `${h + TOP}px`;
   canvas.style.left = `${glyphs.left - host.left - pad}px`;
   canvas.style.top = `${glyphs.top - host.top - pad - TOP}px`;
   const ctx = canvas.getContext('2d')!;
   ctx.scale(dpr, dpr); ctx.translate(0, TOP);            // y = 0 is still the top of the word box
   ctx.font = `600 ${CELL_H}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
   ctx.textBaseline = 'top';
   ctx.fillStyle = style.getPropertyValue('--ink') || getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#1700c4';
   canvas.style.opacity = '1';

   const ink = ctx.fillStyle as string;
   const asciiFont = ctx.font;
   const label = text.textContent ?? '';
   // The pour also spills a row or so above each letter's top, so it reads as poured in.
   const tops = new Map<number, number>();
   for (const cell of cells) tops.set(cell.c, Math.min(tops.get(cell.c) ?? cell.r, cell.r));
   const spill: { x: number; y: number; c: number; r: number }[] = [];
   for (const [c, r] of tops) for (let k = 1; k * CELL_H <= TOP; k++) spill.push({ x: c * CELL_W, y: (r - k) * CELL_H, c, r: r - k });
   const pick = (set: string, c: number, r: number) => set[(((c * 73856093) ^ (r * 19349663)) >>> 0) % set.length];
   const settle = () => FILL_CHARS[Math.floor(Math.random() * FILL_CHARS.length)];

   const start = performance.now();
   const draw = (now: number) => {
    const t = now - start;
    const front = -TOP + Math.min(1, t / POUR) * (h + TOP);              // how far the pour has reached
    const level = h - Math.max(0, (t - POUR) / FILL) * h;               // water surface, css px from top
    const solid = h - Math.max(0, (t - POUR - LAG) / SOLID) * h;        // solid ink surface
    const shift = Math.floor(t / FLOW);
    ctx.clearRect(0, -TOP, w, h + TOP);
    ctx.fillStyle = ink; ctx.font = asciiFont; ctx.textBaseline = 'top'; ctx.globalAlpha = 1;
    const pouring = level > 0;
    for (const cell of spill) if (pouring && cell.y < front) ctx.fillText(pick(POUR_CHARS, cell.c, cell.r - shift), cell.x, cell.y);
    for (const cell of cells) {
     if (cell.y >= solid) continue;                                     // solid ink already here
     if (cell.y + CELL_H > level) {                                     // settled water: dense, churning
      if (!cell.ch || Math.random() < CHURN) cell.ch = settle();
      ctx.fillText(cell.ch, cell.x, cell.y);
     } else if (cell.y < front) {                                       // the stream pouring through
      ctx.fillText(pick(POUR_CHARS, cell.c, cell.r - shift), cell.x, cell.y);
     }
    }
    if (solid < h) {
     ctx.save();
     ctx.beginPath(); ctx.rect(0, Math.max(0, solid), w, h); ctx.clip();
     ctx.font = font; ctx.textBaseline = 'alphabetic';
     if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
     ctx.fillText(label, pad, pad + ascent);
     ctx.restore();
    }
    if (solid > 0) { frame = requestAnimationFrame(draw); return; }
    word.classList.add('is-solid');                                     // hand over to the real text
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
