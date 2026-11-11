'use client';
import { useEffect, useRef } from 'react';

export function IntroCards({items}:{items:readonly (readonly [string,string])[]}) {
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const group=ref.current;
  if(!group)return;
  const media=window.matchMedia('(max-width:599px) and (prefers-reduced-motion:no-preference)');
  const cards=Array.from(group.querySelectorAll<HTMLElement>('.capability'));
  let frame=0;
  let offsets:number[]=[];
  let tallest=0;
  let headerHeight=0;
  const clear=()=>{
   delete group.dataset.stackReady;
   cards.forEach(card=>{card.style.removeProperty('--stack-y');card.style.removeProperty('--stack-glass');});
  };
  const draw=()=>{
   frame=0;
   if(!media.matches){clear();return;}
   const top=group.getBoundingClientRect().top;
   // Keep the entire front card readable, even on short screens or with enlarged text.
   const restingTop=Math.min(headerHeight+24,window.innerHeight-tallest-84);
   const last=offsets.at(-1)??0;
   cards.forEach((card,index)=>{
    const travel=Math.max(0,last-offsets[index]-(cards.length-1-index)*20);
    const y=Math.min(travel,Math.max(0,restingTop+index*20-top-offsets[index]));
    card.style.setProperty('--stack-y',`${y}px`);
    card.style.setProperty('--stack-glass',String(Math.min(1,Math.max(0,restingTop+index*20-top-offsets[index]+80)/160)));
   });
   group.dataset.stackReady='true';
  };
  const queue=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  const measure=()=>{
   headerHeight=document.querySelector<HTMLElement>('.site-header')?.offsetHeight??0;
   offsets=cards.map(card=>card.offsetTop);
   tallest=Math.max(...cards.map(card=>card.offsetHeight));
   queue();
  };
  const observer=new ResizeObserver(measure);
  observer.observe(group);
  cards.forEach(card=>observer.observe(card));
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',measure);
  media.addEventListener('change',measure);
  measure();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',queue);window.removeEventListener('resize',measure);media.removeEventListener('change',measure);clear();};
 },[items]);
 return <div ref={ref} className="capabilities">{items.map(([title,description])=><article className="capability" key={title}><h2>{title}</h2><p>{description}</p></article>)}</div>;
}
