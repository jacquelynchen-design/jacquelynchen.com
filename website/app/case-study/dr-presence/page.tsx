'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CaseProjectDetails } from '@/components/case-project-details';
import { usePortfolio } from '@/components/portfolio-shell';
import { drPresenceCopy } from '@/lib/dr-presence-copy';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import './dr-presence.css';

const sections = ['overview', 'audit', 'research', 'design', 'conclusion'] as const;
const assets = '/assets/dr-presence/';
const visualSources = ['dashboard.png', 'patient-context.png', 'weekly-review.png', 'review-history.png'];
const dashboardSources = ['dashboard-incoming.png', 'dashboard-waiting.png', 'dashboard-completed.png'];
const flowIcons = ['phone.svg', 'readings.svg', 'review.svg', 'phone.svg'];
const bold = (text: string) => text.split('**').map((part, index) => index % 2 ? <strong key={index}>{part}</strong> : part);

export default function DrPresenceCaseStudy() {
 const { language } = usePortfolio();
 const t = drPresenceCopy[language];
 const visuals = t.visuals.map((item, index) => ({ ...item, src: visualSources[index] }));
 const dashboardScreens = t.dashboardScreens.map((item, index) => ({ ...item, src: dashboardSources[index] }));
 const [active, setActive] = useState<string>('overview');
 const [selected, setSelected] = useState<number | null>(null);
 const [dashboardSelected, setDashboardSelected] = useState<number | null>(null);
 const navRef = useRef<HTMLElement>(null);
 const sectionLabel = (index: number) => `${String(index + 1).padStart(2, '0')} - ${t.sections[index]}`;

 useEffect(() => {
  let frame = 0;
  const update = () => {
   frame = 0;
   const threshold = (navRef.current?.getBoundingClientRect().bottom ?? 123) + 24;
   let next: string = sections[0];
   for (const id of sections) if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= threshold) next = id;
   setActive(next);
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(frame); };
 }, []);

 useEffect(() => {
  const align = () => {
   const nav = navRef.current;
   const current = nav?.querySelector<HTMLElement>(`[href="#${active}"]`);
   if (nav && current) nav.scrollTo({ left: current.offsetLeft - (nav.clientWidth - current.offsetWidth) / 2, behavior: 'instant' });
  };
  align();
  window.addEventListener('resize', align);
  return () => window.removeEventListener('resize', align);
 }, [active]);

 const figure = (index: number) => {
  const item = visuals[index];
  return <figure className="case-figure dr-figure"><button type="button" className={`case-visual has-image dr-visual${index === 0 ? ' dr-dashboard-composite' : ''}`} onClick={() => setSelected(index)} aria-label={`${t.enlarge}: ${item.alt}`}><img src={assets + item.src} alt={item.alt} loading="lazy" decoding="async" /></button>{index === 0 && <div className="dr-dashboard-stack">{dashboardScreens.map((screen, screenIndex) => <button key={screen.src} type="button" className="case-visual has-image dr-dashboard-screen" aria-label={`${t.enlarge}: ${screen.alt}`} onClick={() => setDashboardSelected(screenIndex)}><img className="dr-rounded-screen" src={assets + screen.src} width={414} height={868} alt={screen.alt} loading="lazy" decoding="async" /></button>)}</div>}<figcaption>{item.caption}</figcaption></figure>;
 };
 const block = (key: keyof typeof t.blocks, extra = '') => <div className={`dr-block${extra}`}><h3>{t.blocks[key][0]}</h3><p>{t.blocks[key][1]}</p></div>;
 const galleryItems = dashboardSelected !== null ? dashboardScreens : visuals;
 const galleryIndex = dashboardSelected ?? selected;
 const move = (direction: number) => {
  if (dashboardSelected !== null) setDashboardSelected((dashboardSelected + direction + dashboardScreens.length) % dashboardScreens.length);
  else setSelected(current => current === null ? null : (current + direction + visuals.length) % visuals.length);
 };

 return <main id="main" className="case-main dr-presence-case" lang={language}>
  <nav ref={navRef} className="case-nav" aria-label={t.navLabel}>{sections.map((id, index) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setActive(id)}>{sectionLabel(index)}</a>)}</nav>

  <section id="overview" className="case-section case-overview" aria-labelledby="dr-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(0)}</p>
   <div className="case-content dr-overview-content">
    <h1 id="dr-title">{t.title}</h1>
    <div className="dr-content-stack">
     <p className="case-lead">{t.quote}</p>
     <figure className="case-figure dr-figure dr-gif-figure"><div className="dr-gif-stage"><img src={assets + 'dr-presence-prototype-v11.gif'} width={414} height={868} alt={t.gifAlt} decoding="async" /></div><figcaption>{t.gifCaption}</figcaption></figure>
     <div className="dr-prose">{t.intro.map(p => <p key={p}>{bold(p)}</p>)}</div>
     <CaseProjectDetails language={language}>{t.details.map(lines => <p key={lines[0]}>{lines[0]}<br />{lines[1]}</p>)}</CaseProjectDetails>
    </div>
   </div>
  </section>

  <section id="audit" className="case-section" aria-labelledby="dr-audit-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(1)}</p>
   <div className="case-content dr-audit-content">
    <h2 id="dr-audit-title">{t.auditTitle}</h2>
    <figure className="case-figure dr-figure"><div className="dr-original-stage" role="img" aria-label={t.auditAlt}><div className="dr-original-phone dr-original-patient"><img src={assets + 'original-apps.png'} alt="" loading="lazy" decoding="async" /></div><div className="dr-original-phone dr-original-doctor"><img src={assets + 'original-apps.png'} alt="" loading="lazy" decoding="async" /></div></div><figcaption>{t.auditCaption}</figcaption></figure>
    <div className="dr-block">
     <h3>{t.frictionsTitle}</h3>
     <div className="dr-prose">
      {t.frictions.map(p => <p key={p}>{p}</p>)}
      <ul>{t.issues.map(item => <li key={item}>{item}</li>)}</ul>
     </div>
    </div>
   </div>
  </section>

  <section id="research" className="case-section" aria-labelledby="dr-research-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(2)}</p>
   <div className="case-content dr-content-stack">
    <h2 id="dr-research-title">{t.researchTitle}</h2>
    <p>{t.research}</p>
    <div className="dr-affinity-map"><img src={assets + 'affinity-mapping-lower.gif'} width={600} height={561} alt={t.affinityAlt} loading="lazy" decoding="async" /></div>
    <div className="dr-block"><h3>{t.directionTitle}</h3><ul>{t.direction.map(item => <li key={item}>{item}</li>)}</ul></div>
    <div className="dr-block"><h3>{t.workflowTitle}</h3><p>{t.workflow}</p></div>
    <ol className="dr-flow">{t.flow.map((text, index) => <Fragment key={index}>{index > 0 && <li className="dr-flow-arrow" aria-hidden="true"><img src={assets + 'flow-arrow.svg'} alt="" /></li>}<li className="dr-flow-step"><img src={assets + flowIcons[index]} width={24} height={24} alt="" aria-hidden="true" /><span>{text}</span></li></Fragment>)}</ol>
   </div>
  </section>

  <section id="design" className="case-section" aria-labelledby="dr-design-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(3)}</p>
   <div className="case-content dr-content-stack">
    <div className="dr-block dr-scenario"><h2 id="dr-design-title">{t.designTitle}</h2><p>{t.design}</p></div>
    {block('familiar')}
    {figure(0)}
    {block('context')}
    {figure(1)}
    {block('trends', ' dr-trends')}
    {block('control')}
    {figure(2)}
    {block('history')}
    {figure(3)}
   </div>
  </section>

  <section id="conclusion" className="case-section dr-conclusion" aria-labelledby="dr-conclusion-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(4)}</p>
   <div className="case-content dr-content-stack"><h2 id="dr-conclusion-title">{t.conclusionTitle}</h2><div className="dr-prose">{t.conclusion.map(p => <p key={p}>{p}</p>)}</div></div>
  </section>

  <Dialog open={galleryIndex !== null} onOpenChange={open => { if (!open) { setSelected(null); setDashboardSelected(null); } }}>
   <DialogContent customLayout className="maps-gallery-dialog dr-gallery-dialog" showCloseButton={false} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
    <div className="gallery-heading"><DialogTitle>{t.gallery}</DialogTitle><DialogClose className="gallery-close" aria-label={t.close}><Image unoptimized src="/assets/maps/close.svg" width={24} height={24} alt="" /></DialogClose></div>
    <DialogDescription className="sr-only">{t.galleryHelp}</DialogDescription>
    {galleryIndex !== null && <><figure className="dr-gallery-figure">{dashboardSelected !== null ? <div className="dr-single-screen-gallery"><img className="dr-rounded-screen" src={assets + galleryItems[galleryIndex].src} width={414} height={868} alt={galleryItems[galleryIndex].alt} /></div> : <img src={assets + galleryItems[galleryIndex].src} alt={galleryItems[galleryIndex].alt} />}<figcaption>{galleryItems[galleryIndex].caption}</figcaption></figure><div className="dr-gallery-controls"><button type="button" className="action" onClick={() => move(-1)}>{t.previous}</button><span aria-live="polite">{galleryIndex + 1} / {galleryItems.length}</span><button type="button" className="action" onClick={() => move(1)}>{t.next}</button></div></>}
   </DialogContent>
  </Dialog>
 </main>;
}
