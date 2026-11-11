'use client';
import { CaseProjectDetails } from '@/components/case-project-details';
import { CaseResults } from '@/components/case-results';
import { useCaseSectionStack } from '@/components/case-section-stack';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CaseStudyCta } from '@/components/case-study-cta';
import { usePortfolio } from '@/components/portfolio-shell';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import en from '@/lib/scoot-en.json';
import fr from '@/lib/scoot-fr.json';
import { scootVisuals, galleryIds, sectionIds, type ScootVisualId } from '@/lib/scoot-visuals';
export default function ScootCaseStudy(){
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
  const item=scootVisuals[id as ScootVisualId];
  return item?.src?<Image unoptimized src={item.src} width={item.width} height={item.height} alt={label(id)} loading="lazy" />:<span>{label(id)}</span>;
 };
 const open=(id:string,ids:string[]=galleryIds)=>setSelection({ids,index:ids.indexOf(id)});
 const paragraphs=(body:string)=>body.split('\n\n').map(p=><p key={p}>{p}</p>);
 const sectionLabel=(index:number)=>`${String(index+1).padStart(2,'0')} - ${text.sections[index]}`;
 const figure=(id:ScootVisualId,compact=false)=><figure className={`case-figure${compact?' scoot-compact-figure':''}`}><button className="case-visual has-image scoot-enlarge" onClick={()=>open(id)} aria-label={`${text.open}: ${label(id)}`}>{visual(id)}</button><figcaption>{caption(id)}</figcaption></figure>;
 return <><main id="main" className="case-main case-stack scoot-case" lang={language}>
 <nav ref={navRef} className="case-nav" aria-label={language==='fr'?'Sections de l’étude de cas':'Case-study sections'}>{sectionIds.map((id,index)=><a key={id} href={`#${id}`} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{sectionLabel(index)}</a>)}</nav>
 <section id="overview" className="case-section case-overview" tabIndex={-1} aria-labelledby="scoot-title">
  <p className="case-section-label">{sectionLabel(0)}</p>
  <div className="case-content">
   <h1 id="scoot-title">Scoot Career Portal</h1><p className="case-lead">{text.lead}</p><p>{text.intro}</p>
   <CaseProjectDetails language={language}><ul className="project-team">{text.team.map(([name,role])=><li key={name}><strong>{name}</strong><br />{role}</li>)}</ul></CaseProjectDetails>
   <div className="case-block"><h2>{text.challengeTitle}</h2>{paragraphs(text.challenge)}</div>
  </div>
 </section>
 <section id="research" className="case-section" tabIndex={-1} aria-labelledby="research-title">
  <p className="case-section-label">{sectionLabel(1)}</p><div className="case-content"><h2 id="research-title">{text.researchTitle}</h2><p>{text.researchIntro}</p>
   {text.personas.map(persona=><article className="persona" key={persona.id} aria-labelledby={`persona-${persona.id}`}>
    <h3 id={`persona-${persona.id}`}>{persona.title}</h3>
    <div className="persona-grid"><div className="persona-image"><Image unoptimized src={`/assets/scoot/${persona.id}.png`} width={408} height={360} alt={persona.alt} loading="lazy" /></div><div className="persona-details"><p className="persona-goal">{persona.goal}</p>{persona.details.map(([heading,body])=><p key={heading}><strong>{heading}:</strong> {body}</p>)}</div></div><p>{persona.body}</p>
   </article>)}
  </div>
 </section>
 <section id="design" className="case-section" tabIndex={-1} aria-labelledby="design-title">
  <p className="case-section-label">{sectionLabel(2)}</p><div className="case-content case-process">
   <div className="case-block"><h2 id="design-title">{text.designTitle}</h2><p>{text.designIntro}</p><p>{text.mobile}</p></div>
   {text.decisions.map((decision,index)=><div className="case-block" key={decision.title}><h3 className="scoot-decision-title">{decision.title}</h3>{paragraphs(decision.body)}
    {index===0&&figure('job-board',true)}
    {index===1&&<>{figure('skills-results')}<div className="case-gallery" aria-label={text.gallery}>{(['skills-start','skills-select','skills-added'] as const).map(id=><button className="gallery-preview" key={id} aria-label={`${text.open}: ${label(id)}`} onClick={()=>open(id)}>{visual(id)}</button>)}</div></>}
   </div>)}
  </div>
 </section>
 <section id="testing" className="case-section" tabIndex={-1} aria-labelledby="testing-title">
  <p className="case-section-label">{sectionLabel(3)}</p><div className="case-content"><h2 id="testing-title">{text.testingTitle}</h2>{paragraphs(text.testing)}{figure('homepage')}</div>
 </section>
 <section id="takeaways" className="case-section case-takeaways" tabIndex={-1} aria-labelledby="takeaways-title">
  <p className="case-section-label">{sectionLabel(4)}</p><div className="case-content"><CaseResults project="scoot" language={language} titleId="takeaways-title" /><CaseStudyCta href="https://careers.flyscoot.com/" label={text.liveCta} newTabLabel={language==='fr'?'nouvel onglet':'opens in a new tab'} /></div>
 </section>
 <Dialog open={selection!==null} onOpenChange={value=>{if(!value)setSelection(null);}}><DialogContent customLayout className="maps-gallery-dialog scoot-gallery-dialog" showCloseButton={false} onKeyDown={event=>{if(!selection)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();setSelection({...selection,index:(selection.index+(event.key==='ArrowRight'?1:-1)+selection.ids.length)%selection.ids.length});}}}>
 <div className="gallery-heading"><DialogTitle>{text.gallery}</DialogTitle><DialogClose className="gallery-close" aria-label={text.close}><Image unoptimized src="/assets/maps/close.svg" alt="" width="24" height="24" /></DialogClose></div>
 <DialogDescription className="sr-only">{text.galleryHelp}</DialogDescription>
 {selection&&<div className="gallery-body"><div className="gallery-stage" aria-live="polite"><figure className="gallery-selected"><div className="gallery-image">{visual(selection.ids[selection.index])}</div><figcaption>{caption(selection.ids[selection.index])}</figcaption></figure></div><div className="gallery-thumbnails" aria-label={text.gallery}>{selection.ids.map((id,index)=><button ref={element=>{thumbRefs.current[index]=element;}} key={id} className="gallery-thumbnail" aria-label={`${index+1}: ${label(id)}`} aria-pressed={selection.index===index} onClick={()=>setSelection({...selection,index})}>{visual(id)}</button>)}</div></div>}
 </DialogContent></Dialog>
 </main>
 </>;
}
