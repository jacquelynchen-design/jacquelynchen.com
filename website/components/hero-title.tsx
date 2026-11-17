'use client';
import { useEffect, useRef } from 'react';

// "Complexity" fills like a glass of water: streams of tiny ASCII characters pour in
// from above (a little like the Matrix), land at the base of the letters and pile up,
// so the word fills from the bottom; solid ink rises behind the ASCII until the word
// is whole. "into Clarity" stays static. Skipped for visitors who prefer reduced motion.
const RAMP = ' .:-=+*#%@';
const CELL_W = 4;      // css px per ASCII column
const CELL_H = 6;      // css px per ASCII row
const TOP = 28;        // css px above the word where the streams appear
const DELAY = 220;     // ms of pouring before the level starts rising
const FILL = 1350;     // ms for the ASCII level to rise from the base to the top
const LAG = 520;       // ms the solid ink trails the ASCII level
const SOLID = 1250;    // ms for the solid ink to rise from the base to the top
const BAND = 30;       // css px of "live", churning characters at the surface
const RAIN = 0.07;     // new streams per ms while pouring
const FALL = 0.55;     // css px per ms a stream falls (± 30%)

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

   canvas.width = w * dpr; canvas.height = (h + TOP) * dpr;
   canvas.style.width = `${w}px`; canvas.style.height = `${h + TOP}px`;
   canvas.style.left = `${glyphs.left - host.left - pad}px`;
   canvas.style.top = `${glyphs.top - host.top - pad - TOP}px`;
   const ctx = canvas.getContext('2d')!;
   ctx.scale(dpr, dpr); ctx.translate(0, TOP);            // y = 0 is still the top of the word box
   ctx.font = `500 ${CELL_H + 1}px ui-monospace, "SFMono-Regular", Menlo, monospace`;
   ctx.textBaseline = 'top';
   ctx.fillStyle = style.getPropertyValue('--ink') || getComputedStyle(document.documentElement).getPropertyValue('--ink') || '#1700c4';
   canvas.style.opacity = '1';

   const ink = ctx.fillStyle as string;
   const asciiFont = ctx.font;
   const label = text.textContent ?? '';
   // Streams land only where there are letters, so the pour reads as filling the word.
   const lanes = [...new Set(cells.map(c => c.x))];
   const bottom = new Map<number, number>();                // lowest letter cell per lane
   for (const c of cells) bottom.set(c.x, Math.max(bottom.get(c.x) ?? 0, c.y + CELL_H));
   type Drop = { x: number; y: number; v: number; len: number };
   let drops: Drop[] = [];
   const char = () => RAMP[3 + Math.floor(Math.random() * (RAMP.length - 3))];

   const start = performance.now();
   let last = start, owed = 0;
   const draw = (now: number) => {
    const t = now - start, dt = Math.min(50, now - last); last = now;
    const rise = Math.max(0, (t - DELAY) / FILL);
    const level = h - rise * (h + BAND);                     // water surface, css px from top
    const solid = h - Math.max(0, (t - DELAY - LAG) / SOLID) * h;
    const surface = (x: number) => level + 2.5 * Math.sin(x / 16 + t / 110);   // gentle slosh
    ctx.clearRect(0, -TOP, w, h + TOP);
    ctx.fillStyle = ink; ctx.font = asciiFont; ctx.textBaseline = 'top';

    // Pour: spawn streams above the word until the glass is nearly full.
    if (level > CELL_H * 3) {
     owed += RAIN * dt;
     for (; owed >= 1; owed--) drops.push({ x: lanes[Math.floor(Math.random() * lanes.length)], y: -TOP - Math.random() * 20, v: FALL * (0.7 + 0.6 * Math.random()), len: 3 + Math.floor(Math.random() * 5) });
    }
    drops = drops.filter(d => {
     d.y += d.v * dt;
     const floor = Math.min(surface(d.x), bottom.get(d.x) ?? h);
     const head = Math.floor(d.y / CELL_H) * CELL_H;         // snap to the character grid
     for (let k = 0; k < d.len; k++) {
      const y = head - k * CELL_H;
      if (y >= floor || y < -TOP) continue;
      const fadeIn = Math.min(1, (y + TOP) / 18);
      ctx.globalAlpha = (k === 0 ? 0.95 : 0.7 * (1 - k / d.len)) * fadeIn;
      ctx.fillText(char(), d.x, y);
     }
     return head - (d.len - 1) * CELL_H < floor;             // gone once the whole tail has landed
    });

    // Water: ASCII fills the letters below the surface; solid ink rises behind it.
    for (const cell of cells) {
     if (cell.y >= solid) continue;
     const depth = cell.y + CELL_H - surface(cell.x);
     if (depth < 0) continue;
     const live = depth < BAND;
     const v = live ? cell.cover * (0.35 + 0.65 * Math.random()) : cell.cover;
     const jitter = live ? Math.random() : cell.seed;
     const idx = Math.max(1, Math.min(RAMP.length - 1, Math.round(v * (RAMP.length - 1) + (jitter - 0.5) * 2)));
     ctx.globalAlpha = live ? 0.45 + 0.55 * (depth / BAND) : 1;
     ctx.fillText(RAMP[idx], cell.x, cell.y);
    }
    if (solid < h) {
     ctx.save(); ctx.globalAlpha = 1;
     ctx.beginPath(); ctx.rect(0, Math.max(0, solid), w, h); ctx.clip();
     ctx.font = font; ctx.textBaseline = 'alphabetic';
     if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = style.letterSpacing;
     ctx.fillText(label, pad, pad + ascent);
     ctx.restore();
    }
    if (solid > 0 || drops.length) { frame = requestAnimationFrame(draw); return; }
    word.classList.add('is-solid');                          // hand over to the real text
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
