'use client';
import { useEffect, useRef, useState } from 'react';

// Full prototype "movie" for a case study. Plays muted on a loop while on screen.
// Visitors who prefer reduced motion get the first frame and a play control instead.
export function CaseMovie({ src, poster, width, height, label }: { src: string; poster: string; width: number; height: number; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const video = ref.current; if (!video) return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    if (query.matches) return;
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) video.play().catch(() => {}); else video.pause(); }, { threshold: .2 });
    io.observe(video);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} key={src} src={src} poster={poster} width={width} height={height} muted loop playsInline preload="metadata" controls={reduced} aria-label={label} />;
}
