'use client';
import { useEffect, useRef } from 'react';

// On phones the cards are sticky (see home.css): as the page scrolls, each card slides
// up over the previous one and stops 64px lower, leaving the earlier titles visible like
// a stacked deck. Larger screens show a 2×2 grid.
//
// Sticky cards in one container normally release one by one when the container leaves
// the screen, so the deck would collapse into itself. Giving each card a bottom margin
// (cancelled by the next card's negative top margin, so the layout doesn't move) makes
// every card release at the same moment and the deck scrolls away as one piece.
const STEP = 64;
export function IntroCards({items}:{items:readonly (readonly [string,string])[]}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const group=ref.current;
  if(!group)return;
  const cards=Array.from(group.children) as HTMLElement[];
  const media=window.matchMedia('(max-width:700px) and (prefers-reduced-motion:no-preference)');
  const clear=()=>cards.forEach(card=>{card.style.marginTop='';card.style.marginBottom='';});
  const measure=()=>{
   clear();
   if(!media.matches)return;
   const heights=cards.map(card=>card.offsetHeight);
   const last=cards.length-1;
   cards.forEach((card,index)=>{
    if(index===last)return;
    const extra=Math.max(0,STEP*(last-index)+heights[last]-heights[index]);
    card.style.marginBottom=`${extra}px`;
    cards[index+1].style.marginTop=`${-extra}px`;
   });
  };
  const observer=new ResizeObserver(()=>requestAnimationFrame(measure));
  cards.forEach(card=>observer.observe(card));
  media.addEventListener('change',measure);
  measure();
  return()=>{observer.disconnect();media.removeEventListener('change',measure);clear();};
 },[items]);
 return <div ref={ref} className="home-capabilities">{items.map(([title,description],index)=><article className="home-capability" key={title} style={{'--i':index} as React.CSSProperties}><h2>{title}</h2><p>{description}</p></article>)}</div>;
}
