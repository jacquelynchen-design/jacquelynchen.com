'use client';
import { useEffect } from 'react';

export function useCaseSectionStack() {
 useEffect(()=>{
  const main=document.querySelector<HTMLElement>('.case-stack');
  const nav=main?.querySelector<HTMLElement>('.case-nav');
  if(!main||!nav)return;
  const sections=Array.from(main.querySelectorAll<HTMLElement>(':scope > .case-section'));
  let frame=0;
  const measure=()=>{
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>{
    const barBottom=(parseFloat(getComputedStyle(nav).top)||0)+nav.offsetHeight;
    main.style.setProperty('--section-nav-bottom',`${barBottom}px`);
    sections.forEach(section=>section.style.setProperty('--section-stick-top',`${Math.min(barBottom,window.innerHeight-section.offsetHeight)}px`));
   });
  };
  const jump=(event:MouseEvent)=>{
   if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=(event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
   const index=sections.findIndex(section=>`#${section.id}`===link?.getAttribute('href'));
   if(index<0)return;
   event.preventDefault();
   const barBottom=(parseFloat(getComputedStyle(nav).top)||0)+nav.offsetHeight;
   // Sticky boxes no longer report their original document positions, so sum the flow heights.
   const start=main.getBoundingClientRect().top+window.scrollY+nav.offsetHeight;
   const y=start+sections.slice(0,index).reduce((sum,section)=>sum+section.offsetHeight,0)-barBottom;
   history.replaceState(null,'',`#${sections[index].id}`);
   window.scrollTo({top:y,behavior:'instant'});
   sections[index].focus({preventScroll:true});
  };
  const observer=new ResizeObserver(measure);
  observer.observe(nav);sections.forEach(section=>observer.observe(section));
  window.addEventListener('resize',measure);nav.addEventListener('click',jump);
  measure();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',measure);nav.removeEventListener('click',jump);main.style.removeProperty('--section-nav-bottom');sections.forEach(section=>{section.style.removeProperty('--section-stick-top');});};
 },[]);
}
