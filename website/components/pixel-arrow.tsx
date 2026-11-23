// Footer "email me" arrow, built from grid pieces like the hero's ASCII animation.
// A 10×10 grid: the head is a corner of full-strength pieces; the shaft steps diagonally down
// to the tail, fading through the hero's 100 / 70 / 50 / 30% tones. On hover the pieces fill
// to full strength in a wave from tail to head (and the arrow nudges up-right, in CSS).
const N = 10;
const cells: { x: number; y: number; o: number; i: number }[] = [];
const seen = new Set<string>();
const add = (x: number, y: number, o: number, i: number) => { const k = `${x},${y}`; if (!seen.has(k)) { seen.add(k); cells.push({ x, y, o, i }); } };
for (let c = 3; c < N; c++) add(c, 0, 1, 0);                                 // head, top arm (1 piece thick)
for (let r = 1; r <= 6; r++) add(N - 1, r, 1, 0);                            // head, right arm
for (let r = 1; r < N; r++) {                                                // shaft, 1-piece diagonal down to the tail
 const o = r <= 4 ? 1 : r <= 6 ? 0.7 : r <= 7 ? 0.5 : 0.3;
 add(N - 1 - r, r, o, N - r);
}
const GAP = 0.14;

export function PixelArrow({ className }: { className?: string }) {
 return <svg className={`pixel-arrow ${className ?? ''}`} viewBox="-1 -1 12 12" aria-hidden="true" focusable="false">
  {cells.map((c, k) => <rect key={k} x={c.x + GAP / 2} y={c.y + GAP / 2} width={1 - GAP} height={1 - GAP}
   style={{ ['--o' as string]: c.o, ['--i' as string]: c.i }} />)}
 </svg>;
}
