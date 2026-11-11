'use client';
import { CaseProjectDetails } from '@/components/case-project-details';
import { CaseResults } from '@/components/case-results';
import { useCaseSectionStack } from '@/components/case-section-stack';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePortfolio } from '@/components/portfolio-shell';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import content from '@/lib/manor.json';
import './manor.css';
import dimensions from '@/lib/manor-images.json';
import { CaseStudyCta } from '@/components/case-study-cta';
const sectionIds=['overview','brief','exploration','guidelines','takeaways'];
const galleryIds=['logo','family','wordmarks','palette','secondary','menu','packaging','coffee-labels','product-labels'];
export default function ManorCaseStudy(){
 useCaseSectionStack();
 const {language}=usePortfolio();
 const text=language==='fr'?content.FR:content.EN;
 const [active,setActive]=useState<string>('overview');
 const [selection,setSelection]=useState<{ids:string[];index:number}|null>(null);
 const navRef=useRef<HTMLElement>(null);
 const thumbRefs=useRef<(HTMLButtonElement|null)[]>([]);
 useEffect(()=>{
  let frame=0;
  const update=()=>{frame=0;let next:string=sectionIds[0];for(const id of sectionIds){const section=document.getElementById(id);if(section&&section.getBoundingClientRect().top<=(navRef.current?.getBoundingClientRect().bottom??124)+1)next=id;}setActive(next);};
  const onScroll=()=>{if(!frame)frame=window.requestAnimationFrame(update);};
  update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);
  return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);window.cancelAnimationFrame(frame);};
 },[]);
 useEffect(()=>{
  const nav=navRef.current;const selected=nav?.querySelector<HTMLElement>(`[href="#${active}"]`);
  if(nav&&selected)nav.scrollTo({left:selected.offsetLeft-(nav.clientWidth-selected.offsetWidth)/2,behavior:'instant'});
 },[active]);
 useEffect(()=>{if(selection)thumbRefs.current[selection.index]?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});},[selection]);

 const caption=(id:string)=>[...text.process,...text.guidelines].find(item=>item.image===id)?.caption??(language==='fr'?'Le logotype The Manor':'The Manor wordmark');
 const visual=(id:string)=>{const size=dimensions[id as keyof typeof dimensions];return <Image unoptimized src={`/assets/manor/${id}.png`} width={size[0]} height={size[1]} alt={caption(id)} loading="lazy"/>;};
 const open=(id:string)=>setSelection({ids:galleryIds,index:galleryIds.indexOf(id)});
 const paragraphs=(body:string)=>body.split('\n\n').map(p=><p key={p}>{p}</p>);
 const figure=(id:string)=><figure className={`case-figure ${['clear','digital','effects'].includes(id)?'manor-guideline':''}`}><button className="case-visual has-image" onClick={()=>open(id)} aria-label={`${language==='fr'?'Agrandir':'Enlarge'} : ${caption(id)}`}>{visual(id)}</button><figcaption>{caption(id)}</figcaption></figure>;
 return <><main id="main" className="case-main case-stack manor-case" lang={language}>
 <nav ref={navRef} className="case-nav" aria-label={language==='fr'?'Sections de l’étude de cas':'Case-study sections'}>{sectionIds.map((id,index)=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{text.labels[index]}</a>)}</nav>
 <section id="overview" className="case-section case-overview" tabIndex={-1} aria-labelledby="manor-title"><p className="case-section-label">{text.labels[0]}</p><div className="case-content"><h1 id="manor-title">{text.title}</h1><p className="case-lead">{text.subtitle}</p><p>{text.intro}</p>{figure('logo')}<CaseProjectDetails language={language}><p>{text.meta}</p></CaseProjectDetails></div></section>
 <section id="brief" className="case-section" tabIndex={-1} aria-labelledby="brief-title"><p className="case-section-label">{text.labels[1]}</p><div className="case-content"><h2 id="brief-title">{text.briefTitle}</h2>{paragraphs(text.brief)}</div></section>
 <section id="exploration" className="case-section" tabIndex={-1} aria-labelledby="exploration-title"><p className="case-section-label">{text.labels[2]}</p><div className="case-content case-process">{text.process.map((item,index)=><div className="case-block" key={item.image}><h2 id={index===0?'exploration-title':undefined}>{item.title}</h2><p>{item.body}</p>{figure(item.image)}</div>)}</div></section>
 <section id="guidelines" className="case-section" tabIndex={-1} aria-labelledby="guidelines-title"><p className="case-section-label">{text.labels[3]}</p><div className="case-content"><h2 id="guidelines-title">{text.deliveryTitle}</h2><p>{text.delivery}</p>{text.guidelines.map(item=><div key={item.image}>{figure(item.image)}</div>)}</div></section>
 <section id="takeaways" className="case-section case-takeaways" tabIndex={-1} aria-labelledby="takeaways-title"><p className="case-section-label">{text.labels[4]}</p><div className="case-content"><CaseResults project="manor" language={language} titleId="takeaways-title" /><CaseStudyCta iconSrc="/assets/manor/pdf.svg" href="/assets/manor/the-manor-visual-identity-proposal.pdf" label={text.cta} newTabLabel={language==='fr'?'nouvel onglet, PDF en anglais':'PDF, opens in a new tab'} /></div></section>
 <Dialog open={selection!==null} onOpenChange={value=>{if(!value)setSelection(null);}}><DialogContent customLayout className="maps-gallery-dialog manor-gallery-dialog" showCloseButton={false} onKeyDown={event=>{if(!selection)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();setSelection({...selection,index:(selection.index+(event.key==='ArrowRight'?1:-1)+selection.ids.length)%selection.ids.length});}}}>
 <div className="gallery-heading"><DialogTitle>{language==='fr'?'Images du projet':'Project images'}</DialogTitle><DialogClose className="gallery-close" aria-label={language==='fr'?'Fermer':'Close'}><Image unoptimized src="/assets/maps/close.svg" alt="" width="24" height="24" /></DialogClose></div>
 <DialogDescription className="sr-only">{language==='fr'?'Utilisez les flèches pour parcourir les images et Échap pour fermer.':'Use the arrow keys to browse images and Escape to close.'}</DialogDescription>
 {selection&&<div className="gallery-body"><div className="gallery-stage" aria-live="polite"><figure className="gallery-selected"><div className="gallery-image">{visual(selection.ids[selection.index])}</div><figcaption>{caption(selection.ids[selection.index])}</figcaption></figure></div><div className="gallery-thumbnails" aria-label={language==='fr'?'Images du projet':'Project images'}>{selection.ids.map((id,index)=><button ref={element=>{thumbRefs.current[index]=element;}} key={id} className="gallery-thumbnail" aria-label={`${index+1}: ${caption(id)}`} aria-pressed={selection.index===index} onClick={()=>setSelection({...selection,index})}>{visual(id)}</button>)}</div></div>}
 </DialogContent></Dialog>
 </main>
 </>;
}
