'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CaseProjectDetails } from '@/components/case-project-details';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import './dr-presence.css';

const sections = ['overview', 'audit', 'research', 'design', 'conclusion'] as const;
const names = ['Overview', 'Audit', 'Research', 'Design', 'Conclusion'];
const assets = '/assets/dr-presence/';
const visuals = [
 { src: 'dashboard.png', caption: 'The dashboard shows the scheduled reviews of the current day, then those of the next, when all reviews of the day are completed', alt: 'Doctor dashboard showing scheduled reviews and a notification when Pauline submits her measurements.' },
 { src: 'patient-context.png', caption: 'One patient file connects medical context with measurement review', alt: 'Pauline’s patient file and measurement view, shown side by side.' },
 { src: 'weekly-review.png', caption: 'Patient-reported entries for the past week', alt: 'Seven days of Pauline’s blood pressure measurements and medication entries.' },
 { src: 'review-history.png', caption: 'Review list and selected review page', alt: 'Pauline’s review history and a selected review recording medication changes.' },
];
const dashboardScreens = [
 { src: 'dashboard-incoming.png', caption: 'Pauline’s measurements are ready for review.', alt: 'Dashboard with Pauline’s incoming measurements and a Review measurements button.' },
 { src: 'dashboard-waiting.png', caption: 'Waiting for the next scheduled review.', alt: 'Dashboard waiting for the next review, with today’s scheduled patients.' },
 { src: 'dashboard-completed.png', caption: 'Today’s reviews are complete; tomorrow’s schedule is shown.', alt: 'Dashboard showing all reviews completed today and the patients scheduled for tomorrow.' },
];
const flow = [
 { icon: 'phone.svg', text: 'Patient phones the GP for the scheduled review' },
 { icon: 'readings.svg', text: 'Patient shares home readings through the app' },
 { icon: 'review.svg', text: 'GP opens the patient record and reviews the readings' },
 { icon: 'phone.svg', text: 'GP discusses the next steps by phone' },
];

export default function DrPresenceCaseStudy() {
 const [active, setActive] = useState<string>('overview');
 const [selected, setSelected] = useState<number | null>(null);
 const [dashboardSelected, setDashboardSelected] = useState<number | null>(null);
 const navRef = useRef<HTMLElement>(null);
 const sectionLabel = (index: number) => `${String(index + 1).padStart(2, '0')} - ${names[index]}`;

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
  return <figure className="case-figure dr-figure"><button type="button" className={`case-visual has-image dr-visual${index === 0 ? ' dr-dashboard-composite' : ''}`} onClick={() => setSelected(index)} aria-label={`Enlarge: ${item.alt}`}><img src={assets + item.src} alt={item.alt} loading="lazy" decoding="async" /></button>{index === 0 && <div className="dr-dashboard-stack">{dashboardScreens.map((screen, screenIndex) => <button key={screen.src} type="button" className="case-visual has-image dr-dashboard-screen" aria-label={`Enlarge: ${screen.alt}`} onClick={() => setDashboardSelected(screenIndex)}><img className="dr-rounded-screen" src={assets + screen.src} width={414} height={868} alt={screen.alt} loading="lazy" decoding="async" /></button>)}</div>}<figcaption>{item.caption}</figcaption></figure>;
 };
 const galleryItems = dashboardSelected !== null ? dashboardScreens : visuals;
 const galleryIndex = dashboardSelected ?? selected;
 const move = (direction: number) => {
  if (dashboardSelected !== null) setDashboardSelected((dashboardSelected + direction + dashboardScreens.length) % dashboardScreens.length);
  else setSelected(current => current === null ? null : (current + direction + visuals.length) % visuals.length);
 };

 return <main id="main" className="case-main dr-presence-case" lang="en">
  <nav ref={navRef} className="case-nav" aria-label="Case-study sections">{sections.map((id, index) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setActive(id)}>{sectionLabel(index)}</a>)}</nav>

  <section id="overview" className="case-section case-overview" aria-labelledby="dr-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(0)}</p>
   <div className="case-content dr-overview-content">
    <h1 id="dr-title">Dr Presence: Supporting the GP’s next decision</h1>
    <div className="dr-content-stack">
     <p className="case-lead">“Could we do follow up visits remotely?”</p>
     <figure className="case-figure dr-figure dr-gif-figure"><div className="dr-gif-stage"><img src={assets + 'dr-presence-prototype-v10.gif'} width={414} height={868} alt="Animated walkthrough of the Dr Presence doctor app, from the dashboard to Pauline’s measurements and review." decoding="async" /></div><figcaption>The final screens</figcaption></figure>
     <div className="dr-prose">
      <p>Three general practitioners (GPs) in Singapore wanted to support chronic-condition follow-ups with readings collected at home. The opportunity was to help doctors review those readings before deciding what follow-up was needed. The GPs have built a <strong>doctor-facing</strong> and a <strong>patient-facing</strong> app, but needed designers to improve the usability and visual design.</p>
      <p>Over six weeks in January 2021, I teamed up with three other designers to take on this project. We were at the end of our UX design intensive training course and had the opportunity to work on a client case. Our team performed tasks for both apps: product audit, user research, usability tests, iterative wireframing and prototyping. I worked on both apps, and created their design systems.</p>
      <p>This abridged story of the doctor-facing app follows one GP reviewing seven days of measurements of Pauline, his patient with hypertension.</p>
     </div>
     <CaseProjectDetails><p>Project started January 2021 in Singapore<br />Duration: 6 weeks with 4 UX designers</p><p>Client team: 3 general practitioners<br />Deliverables: Doctor and patient app</p></CaseProjectDetails>
    </div>
   </div>
  </section>

  <section id="audit" className="case-section" aria-labelledby="dr-audit-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(1)}</p>
   <div className="case-content dr-audit-content">
    <h2 id="dr-audit-title">UX audit of the original build</h2>
    <figure className="case-figure dr-figure"><div className="dr-original-stage" role="img" aria-label="The original patient and doctor apps built by the doctor team"><div className="dr-original-phone dr-original-patient"><img src={assets + 'original-apps.png'} alt="" loading="lazy" decoding="async" /></div><div className="dr-original-phone dr-original-doctor"><img src={assets + 'original-apps.png'} alt="" loading="lazy" decoding="async" /></div></div><figcaption>The apps built by the doctor team</figcaption></figure>
    <div className="dr-block">
     <h3>Key frictions identified</h3>
     <div className="dr-prose">
      <p>The requirements are that the product only exchanged measurements, from the patient app to the doctor app. It would not be possible to make calls with the apps, any verbal communication between the doctor and patient would have to happen outside of the app. However, the interface suggested a live teleconsultation with the button “Telemode” on the navigation bar.</p>
      <p>We performed a heuristic analysis and found that usability in general of the two apps measured poorly, due to the following issues:</p>
      <ul><li>A misunderstanding that the app performed active teleconsulting in “telemode”, when the main capability was actually for simply receiving health measurements. There is no call function possible.</li><li>The lack of system feedback and error prevention</li><li>Lack of design and typographical hierarchy</li><li>Usage of technical and medical jargon</li><li>Buttons too small and close to each other, increasing the chances of misclicks</li><li>Contrast issues, font sizes too small</li></ul>
     </div>
    </div>
   </div>
  </section>

  <section id="research" className="case-section" aria-labelledby="dr-research-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(2)}</p>
   <div className="case-content dr-content-stack">
    <h2 id="dr-research-title">Going back to the drawing board</h2>
    <p>We interviewed seven doctors and eight patients, and examined how people used the existing apps. Home readings were often kept in notebooks or phone notes. Doctors saw potential for remote follow-ups when clinically appropriate.</p>
    <div className="dr-affinity-map"><img src={assets + 'affinity-mapping-lower.gif'} width={600} height={561} alt="Animated affinity map of the doctor and patient research, showing findings grouped into themes." loading="lazy" decoding="async" /></div>
    <div className="dr-block"><h3>The design direction: give readings context</h3><ul><li>A submission needed to connect to the patient’s record and medication history. Usability feedback on the prototype reinforced the need to see medication and other measurements alongside the readings.</li><li>That shaped the review experience: make new submissions visible, keep patient context close and support comparison over time.</li></ul></div>
    <div className="dr-block"><h3>Work with the existing care workflow</h3><p>We clarified the handoff between the patient app, doctor app and a phone call: patients and doctors communicate mainly via calls, but the data transmissions happened from the patient app to the doctor app. The product supported remote follow up visits to ensure clarity and track patterns on the patients’ health data.</p></div>
    <ol className="dr-flow">{flow.map((step, index) => <Fragment key={step.text}>{index > 0 && <li className="dr-flow-arrow" aria-hidden="true"><img src={assets + 'flow-arrow.svg'} alt="" /></li>}<li className="dr-flow-step"><img src={assets + step.icon} width={24} height={24} alt="" aria-hidden="true" /><span>{step.text}</span></li></Fragment>)}</ol>
   </div>
  </section>

  <section id="design" className="case-section" aria-labelledby="dr-design-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(3)}</p>
   <div className="case-content dr-content-stack">
    <div className="dr-block dr-scenario"><h2 id="dr-design-title">A scheduled review with Pauline</h2><p>Pauline has a scheduled hypertension follow-up. This illustrative scenario shows how the design supports her GP from an incoming submission to a discussion about medication use.</p></div>
    <div className="dr-block"><h3>Review visits should still feel the same</h3><p>Pauline sends her measurements at a scheduled time and date, not unlike her weekly visits to the clinic. This still maintains a sense of familiarity of the reviews for both parties. The dashboard highlights her entry and offers the GP a direct route to review. As the visits are scheduled in advance, the GP would be able to expect them at a certain date and time.</p></div>
    {figure(0)}
    <div className="dr-block"><h3>Keep the patient’s context in the picture</h3><p>Pauline’s record and measurements sit in the same patient file. The GP can check her condition and previous reviews before interpreting the latest readings.</p></div>
    {figure(1)}
    <div className="dr-block dr-trends"><h3>Compare trends without losing meaning</h3><p>Alongside the blood-pressure trend, Pauline’s medication log shows two reported missed doses. “Not logged” remains a separate state, so missing data does not become a clinical assumption.</p></div>
    <div className="dr-block"><h3>The GP remains in control</h3><p>Pauline’s records give the GP the full picture and a reason to ask, rather than an explanation on their own. In this scenario, the GP discusses the entries with Pauline by phone and advises her to continue medication as prescribed.</p></div>
    {figure(2)}
    <div className="dr-block"><h3>Each review records modifications to medications and measurement targets</h3><p>The patient file contains a list of reviews that have occurred in the past or are scheduled, which act as a record of the changes made to medication and certain measurement targets. Any review with a modification is marked with the respective icon. This allows a potentially long list to be scannable if the GP needs to look for a specific review where modifications were applied.</p></div>
    {figure(3)}
   </div>
  </section>

  <section id="conclusion" className="case-section dr-conclusion" aria-labelledby="dr-conclusion-title" tabIndex={-1}>
   <p className="case-section-label">{sectionLabel(4)}</p>
   <div className="case-content dr-content-stack"><h2 id="dr-conclusion-title">A clearer way to track remote follow-up visits</h2><div className="dr-prose"><p>The doctor app connected incoming readings, patient context and history into a focused review workflow. The patient app allows the patient to record and send measurements remotely. For the service to work, it was imperative for our design to ensure that data transferred from the patient app is reliable, and the data collected on the doctor app is presented in a way that’s meaningful, to help the GP uncover insights about the patient’s health data.</p><p>Engagement with the client ended after delivery: findings in the audit, insights gained from the user research and usability test, revised prototypes for both apps and design systems. A next validation round would test interpretation accuracy, review time and whether the data visualisation of patients’ submissions provides meaningful information to aid in decision making.</p></div></div>
  </section>

  <Dialog open={galleryIndex !== null} onOpenChange={open => { if (!open) { setSelected(null); setDashboardSelected(null); } }}>
   <DialogContent customLayout className="maps-gallery-dialog dr-gallery-dialog" showCloseButton={false} onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); } }}>
    <div className="gallery-heading"><DialogTitle>Dr Presence · Design details</DialogTitle><DialogClose className="gallery-close" aria-label="Close image"><Image unoptimized src="/assets/maps/close.svg" width={24} height={24} alt="" /></DialogClose></div>
    <DialogDescription className="sr-only">Use the previous and next buttons or the left and right arrow keys to browse. Press Escape to close.</DialogDescription>
    {galleryIndex !== null && <><figure className="dr-gallery-figure">{dashboardSelected !== null ? <div className="dr-single-screen-gallery"><img className="dr-rounded-screen" src={assets + galleryItems[galleryIndex].src} width={414} height={868} alt={galleryItems[galleryIndex].alt} /></div> : <img src={assets + galleryItems[galleryIndex].src} alt={galleryItems[galleryIndex].alt} />}<figcaption>{galleryItems[galleryIndex].caption}</figcaption></figure><div className="dr-gallery-controls"><button type="button" className="action" onClick={() => move(-1)}>Previous</button><span aria-live="polite">{galleryIndex + 1} / {galleryItems.length}</span><button type="button" className="action" onClick={() => move(1)}>Next</button></div></>}
   </DialogContent>
  </Dialog>
 </main>;
}
