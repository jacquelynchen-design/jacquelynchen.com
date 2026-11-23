'use client';
import { useEffect, useRef } from 'react';

// A short looping clip laid over a homepage thumbnail's screen.
// Each clip holds its first frame ~2s, plays a few key screens, then fades back to the start.
// Geometry is in the thumbnail image's own pixels, so the overlay scales with it.
export type ThumbLoopSpec = {
  src: string; poster: string;
  size: [number, number];               // thumbnail image size
  rect: [number, number, number, number]; // screen x, y, w, h
  radius: number;                       // screen corner radius
  cover?: string;                       // layer drawn above the clip (e.g. a device in front of the screen)
};

export function ThumbLoop({ spec }: { spec: ThumbLoopSpec }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current; if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const sync = () => { if (visible && !reduced.matches) video.play().catch(() => {}); else video.pause(); };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: .25 });
    io.observe(video); reduced.addEventListener('change', sync);
    return () => { io.disconnect(); reduced.removeEventListener('change', sync); };
  }, []);
  const [W, H] = spec.size, [x, y, w, h] = spec.rect;
  const pct = (a: number, b: number) => `${(a / b) * 100}%`;
  return <>
    <video ref={ref} className="home-thumb-loop" src={spec.src} poster={spec.poster} muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1}
      style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H), borderRadius: `${pct(spec.radius, w)} / ${pct(spec.radius, h)}` }} />
    {spec.cover && <img className="home-thumb-cover" src={spec.cover} alt="" aria-hidden="true" decoding="async" />}
  </>;
}
