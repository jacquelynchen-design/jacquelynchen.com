'use client';
import { useEffect, useRef } from 'react';

// Homepage preview clips. Geometry is in the thumbnail image's own pixels, so everything scales with it.
//
// Stage clips (`from`/`to`): the clip shows ONE device, rebuilt in code and rendered to video. It starts
// exactly on top of that device in the static thumbnail, the rest of the thumbnail fades away while the
// device glides to the centre, the clip plays, then it glides back, the thumbnail returns, and it rests
// for `pause` seconds before playing again.
export type StageLoopSpec = {
  src: string;
  size: [number, number];                 // thumbnail image size
  from: [number, number, number, number]; // device rect in the static thumbnail
  to: [number, number, number, number];   // device rect while the clip plays (centred)
  radius: number;                         // device outer corner radius, image px at `from` size
  intro?: number; outro?: number;         // seconds spent gliding in / out (inside the clip's own hold)
  pause?: number;                         // seconds the static thumbnail rests between plays
  fadeImage?: boolean;                    // false keeps the thumbnail (bezel) visible under the clip
  crossfade?: boolean;                    // the clip's first frame differs from the thumbnail: fade it in/out while gliding
};
// Legacy overlay clips (`rect`): a clip laid over the thumbnail's screen.
export type OverlayLoopSpec = {
  src: string; poster: string;
  size: [number, number];
  rect: [number, number, number, number];
  radius: number;
  cover?: string;
};
export type ThumbLoopSpec = StageLoopSpec | OverlayLoopSpec;

const ease = (x: number) => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const clamp = (x: number) => Math.min(1, Math.max(0, x));

function useInView(ref: React.RefObject<HTMLElement | null>, onChange: (play: boolean) => void) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => onChange(visible && !reduced.matches);
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .25 });
    io.observe(el); reduced.addEventListener('change', sync);
    return () => { io.disconnect(); reduced.removeEventListener('change', sync); };
  }, [ref, onChange]);
}

function StageLoop({ spec }: { spec: StageLoopSpec }) {
  const ref = useRef<HTMLVideoElement>(null);
  const state = useRef({ play: false, timer: 0 as unknown as ReturnType<typeof setTimeout>, raf: 0 });
  const [W, H] = spec.size, intro = spec.intro ?? .9, outro = spec.outro ?? .9, pause = spec.pause ?? 2;

  useEffect(() => {
    const video = ref.current; if (!video) return;
    const img = video.parentElement?.querySelector('img') as HTMLImageElement | null;
    const s = state.current;
    const place = (k: number) => {           // k: 0 = resting on the static device, 1 = centred
      const e = ease(clamp(k));
      const r = spec.from.map((a, i) => a + (spec.to[i] - a) * e);
      video.style.left = `${(r[0] / W) * 100}%`; video.style.top = `${(r[1] / H) * 100}%`;
      video.style.width = `${(r[2] / W) * 100}%`; video.style.height = `${(r[3] / H) * 100}%`;
      video.style.borderRadius = `${(spec.radius / spec.from[2]) * 100}% / ${(spec.radius / spec.from[3]) * 100}%`;
      if (img && spec.fadeImage !== false) img.style.opacity = String(1 - ease(clamp(k * 1.6)));
      if (spec.crossfade) video.style.opacity = String(ease(clamp(k * 1.6)));
    };
    const tick = () => {
      const t = video.currentTime, d = video.duration || 1;
      place(t < intro ? t / intro : t > d - outro ? (d - t) / outro : 1);
      s.raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!s.play) return; video.currentTime = 0; video.style.opacity = '1'; video.play().catch(() => {}); cancelAnimationFrame(s.raf); s.raf = requestAnimationFrame(tick); };
    const onEnded = () => { cancelAnimationFrame(s.raf); place(0); video.style.opacity = '0'; s.timer = setTimeout(start, pause * 1000); };
    video.addEventListener('ended', onEnded);
    place(0); video.style.opacity = '0';
    (video as HTMLVideoElement & { __set?: (p: boolean) => void }).__set = (play: boolean) => {
      s.play = play; clearTimeout(s.timer);
      if (play) s.timer = setTimeout(start, pause * 1000);
      else { video.pause(); cancelAnimationFrame(s.raf); place(0); video.style.opacity = '0'; }
    };
    return () => { video.removeEventListener('ended', onEnded); clearTimeout(s.timer); cancelAnimationFrame(s.raf); if (img) img.style.opacity = ''; };
  }, [spec, W, H, intro, outro, pause]);

  const onChange = useRef((play: boolean) => (ref.current as (HTMLVideoElement & { __set?: (p: boolean) => void }) | null)?.__set?.(play)).current;
  useInView(ref, onChange);
  return <video ref={ref} className="home-thumb-loop home-thumb-stage" src={spec.src} muted playsInline preload="auto" aria-hidden="true" tabIndex={-1} />;
}

function OverlayLoop({ spec }: { spec: OverlayLoopSpec }) {
  const ref = useRef<HTMLVideoElement>(null);
  const onChange = useRef((play: boolean) => { const v = ref.current; if (!v) return; if (play) v.play().catch(() => {}); else v.pause(); }).current;
  useInView(ref, onChange);
  const [W, H] = spec.size, [x, y, w, h] = spec.rect;
  const pct = (a: number, b: number) => `${(a / b) * 100}%`;
  return <>
    <video ref={ref} className="home-thumb-loop" src={spec.src} poster={spec.poster} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}
      style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H), borderRadius: `${pct(spec.radius, w)} / ${pct(spec.radius, h)}` }} />
    {spec.cover && <img className="home-thumb-cover" src={spec.cover} alt="" aria-hidden="true" decoding="async" />}
  </>;
}

export function ThumbLoop({ spec }: { spec: ThumbLoopSpec }) {
  return 'from' in spec ? <StageLoop spec={spec} /> : <OverlayLoop spec={spec} />;
}
