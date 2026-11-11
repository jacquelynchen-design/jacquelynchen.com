'use client';
import { CaseResults } from '@/components/case-results';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useCaseSectionStack } from '@/components/case-section-stack';
import { usePortfolio } from '@/components/portfolio-shell';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import en from '@/lib/maps-en.json';
import fr from '@/lib/maps-fr.json';
import { mapsVisuals, galleryIds, sectionIds } from '@/lib/maps-visuals';
export default function MapsCaseStudy(){
 useCaseSectionStack();
 const {language}=usePortfolio();
 const text=language==='fr'?fr:en;
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
 const label=(id:string)=>text.visuals[id as keyof typeof text.visuals]??id;
 const caption=(id:string)=>text.captions[id as keyof typeof text.captions]??label(id);
 const visual=(id:string)=>{
  const item=mapsVisuals.find(item=>item.id===id);
  return item?.src?<Image unoptimized src={item.src} width={item.width} height={item.height} alt={label(id)} loading="lazy" />:<span>{label(id)}</span>;
 };
 const open=(id:string,ids:string[])=>setSelection({ids,index:ids.indexOf(id)});
 const paragraphs=(body:string)=>body.split('\n\n').map(p=><p key={p}>{p}</p>);
 const sectionLabel=(index:number)=>`${String(index+1).padStart(2,'0')} - ${text.sections[index]}`;
 return <main id="main" className="case-main case-stack" lang={language}>
 <nav ref={navRef} className="case-nav" aria-label={language==='fr'?'Sections de l’étude de cas':'Case-study sections'}>{sectionIds.map((id,index)=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{sectionLabel(index)}</a>)}</nav>
 <section id="overview" className="case-section case-overview" tabIndex={-1} aria-labelledby="maps-title"><p className="case-section-label">{sectionLabel(0)}</p><div className="case-content"><h1 id="maps-title">Maps</h1><p className="case-lead">{text.quote}</p><p>{text.intro}</p><aside className="persona"><h2>{text.personaTitle}</h2><div className="persona-grid"><div className="persona-image"><Image unoptimized src="/assets/maps/antoine.png" width="404" height="269" alt={text.personaAlt} /></div><div className="persona-details"><blockquote>{text.personaQuote}</blockquote>{text.personaDetails.map(detail=>{const [heading,...rest]=detail.split(' : ');return <p key={heading}><strong>{heading}</strong> : {rest.join(' : ')}</p>;})}</div></div><p>{text.personaBody}</p></aside><p className="case-note">{text.note}</p></div></section>
 <section id="problem" className="case-section" tabIndex={-1} aria-labelledby="problem-title"><p className="case-section-label">{sectionLabel(1)}</p><div className="case-content"><h2 id="problem-title">{text.problemTitle}</h2>{paragraphs(text.problem)}</div></section>
 <section id="process" className="case-section" tabIndex={-1} aria-labelledby="process-title"><p className="case-section-label">{sectionLabel(2)}</p><div className="case-content case-process">{text.process.map((item,index)=><div className="case-block" key={item.title}><h2 id={index===0?'process-title':undefined}>{item.title}</h2>{paragraphs(item.body)}{item.visuals.map(id=><figure key={id} className="case-figure"><div className={`case-visual${mapsVisuals.find(item=>item.id===id)?.src?' has-image':''}`}>{visual(id)}</div><figcaption>{caption(id)}</figcaption></figure>)}</div>)}</div></section>
 <section id="delivery" className="case-section" tabIndex={-1} aria-labelledby="delivery-title"><p className="case-section-label">{sectionLabel(3)}</p><div className="case-content case-process"><div className="case-block"><h2 id="delivery-title">{text.deliveryTitle}</h2>{paragraphs(text.delivery)}</div><div className="case-block"><h2>{text.galleryTitle}</h2><p>{text.galleryIntro}</p><div className="case-gallery" aria-label={text.gallery}>{galleryIds.map(id=><button className="gallery-preview" key={id} aria-label={`${text.open}: ${label(id)}`} onClick={()=>open(id,galleryIds)}>{visual(id)}</button>)}</div></div></div></section>
 <section id="takeaways" className="case-section case-takeaways" tabIndex={-1} aria-labelledby="takeaways-title"><p className="case-section-label">{sectionLabel(4)}</p><div className="case-content"><CaseResults project="maps" language={language} titleId="takeaways-title" /></div></section>
 <Dialog open={selection!==null} onOpenChange={value=>{if(!value)setSelection(null);}}><DialogContent customLayout className="maps-gallery-dialog" showCloseButton={false} onKeyDown={event=>{if(!selection)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();setSelection({...selection,index:(selection.index+(event.key==='ArrowRight'?1:-1)+selection.ids.length)%selection.ids.length});}}}>
 <div className="gallery-heading"><DialogTitle>{text.gallery}</DialogTitle><DialogClose className="gallery-close" aria-label={text.close}><Image unoptimized src="/assets/maps/close.svg" alt="" width="24" height="24" /></DialogClose></div>
 <DialogDescription className="sr-only">{language==='fr'?'Choisissez une miniature ou utilisez les flèches du clavier pour changer d’image.':'Choose a thumbnail or use the arrow keys to change images.'}</DialogDescription>
 {selection&&<div className="gallery-body"><div className="gallery-stage" aria-live="polite"><figure className="gallery-selected"><div className="gallery-image">{visual(selection.ids[selection.index])}</div><figcaption>{caption(selection.ids[selection.index])}</figcaption></figure></div><div className="gallery-thumbnails" aria-label={text.gallery}>{selection.ids.map((id,index)=><button ref={element=>{thumbRefs.current[index]=element;}} key={id} className="gallery-thumbnail" aria-label={`${text.image} ${index+1}: ${label(id)}`} aria-pressed={selection.index===index} onClick={()=>setSelection({...selection,index})}>{visual(id)}</button>)}</div></div>}
 </DialogContent></Dialog>
 </main>;
}
