'use client';
import { CaseProjectDetails } from '@/components/case-project-details';
import { CaseResults } from '@/components/case-results';
import { useCaseSectionStack } from '@/components/case-section-stack';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { CaseStudyCta } from '@/components/case-study-cta';
import { usePortfolio } from '@/components/portfolio-shell';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import en from '@/lib/pm8000-en.json';
import fr from '@/lib/pm8000-fr.json';
import visuals from '@/lib/pm8000-visuals.json';

const sections = ['overview', 'challenge', 'design', 'outcome', 'reflections'];

export default function PM8000CaseStudy() {
 useCaseSectionStack();
  const { language } = usePortfolio();
  const text = language === 'fr' ? fr : en;
  const [active, setActive] = useState(sections[0]);
  const [selected, setSelected] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const caption = (id: number) => text.captions[String(id) as keyof typeof text.captions];
  const sectionLabel = (index: number) => `${String(index + 1).padStart(2, '0')} - ${text.sections[index]}`;
  const paragraphs = (body: string) => body.split('\n\n').map(p => <p key={p}>{p}</p>);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0];
      for (const id of sections) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) <= (navRef.current?.getBoundingClientRect().bottom ?? 124) + 1) current = id;
      }
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    const link = nav?.querySelector<HTMLElement>(`[href="#${active}"]`);
    if (nav && link) nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'instant' });
  }, [active]);

  const picture = (id: number, eager = false) => {
    const asset = visuals.find(item => item.id === id)!;
    return <Image unoptimized src={asset.src} width={asset.width} height={asset.height} alt={caption(id)} loading={eager ? 'eager' : 'lazy'} />;
  };
  const figure = (id: number) => <figure className="case-figure" key={id}>
    <button className="case-visual has-image pm8000-image" aria-label={`${text.open}: ${caption(id)}`} onClick={() => setSelected(id)}>{picture(id)}</button>
    <figcaption>{caption(id)}</figcaption>
  </figure>;
  const changeImage = (direction: number) => setSelected(id => {
    const index = visuals.findIndex(item => item.id === id);
    return visuals[(index + direction + visuals.length) % visuals.length].id;
  });

  return <><main id="main" className="case-main case-stack pm8000-case" lang={language}>
    <nav ref={navRef} className="case-nav" aria-label={language === 'fr' ? 'Sections de l’étude de cas' : 'Case-study sections'}>
      {sections.map((id, index) => <a key={id} href={`#${id}`} aria-current={active === id ? 'location' : undefined} onClick={() => setActive(id)}>{sectionLabel(index)}</a>)}
    </nav>
    <section id="overview" className="case-section case-overview" tabIndex={-1} aria-labelledby="pm8000-title">
      <p className="case-section-label">{sectionLabel(0)}</p>
      <div className="case-content">
        <h1 id="pm8000-title">Profometer PM8000 Pro</h1>
        <p className="case-lead">{text.lead}</p>
        <p>{text.intro}</p>
        <figure className="case-figure"><div className="case-visual has-image pm8000-inspector"><div className="pm8000-inspector-crop">{picture(1, true)}</div></div><figcaption>{caption(1)}</figcaption></figure>
        <CaseProjectDetails language={language}><dl className="pm8000-credits"><div><dt>{text.roleTitle}</dt><dd>{text.role}</dd></div><div><dt>{text.teamTitle}</dt>{text.team.map(member => <dd key={member}>{member}</dd>)}</div></dl></CaseProjectDetails>
      </div>
    </section>
    <section id="challenge" className="case-section" tabIndex={-1} aria-labelledby="challenge-title">
      <p className="case-section-label">{sectionLabel(1)}</p><div className="case-content"><h2 id="challenge-title">{text.challengeTitle}</h2>{paragraphs(text.challenge)}</div>
    </section>
    <section id="design" className="case-section" tabIndex={-1} aria-labelledby="design-title">
      <p className="case-section-label">{sectionLabel(2)}</p><div className="case-content case-process">{text.process.map((item, index) => <div className="case-block" key={item.title}><h2 id={index === 0 ? 'design-title' : undefined}>{item.title}</h2>{paragraphs(item.body)}{item.images.map(figure)}</div>)}</div>
    </section>
    <section id="outcome" className="case-section" tabIndex={-1} aria-labelledby="outcome-title">
      <p className="case-section-label">{sectionLabel(3)}</p><div className="case-content"><h2 id="outcome-title">{text.outcomeTitle}</h2>{paragraphs(text.outcome)}</div>
    </section>
    <section id="reflections" className="case-section case-takeaways" tabIndex={-1} aria-labelledby="reflections-title">
      <p className="case-section-label">{sectionLabel(4)}</p><div className="case-content"><CaseResults project="pm8000" language={language} titleId="reflections-title" /><CaseStudyCta href="https://www.screeningeagle.com/en/products/profometer-pm8000-pro" label={language === 'fr' ? 'Voir le site du produit ici' : 'See the product website here'} newTabLabel={language === 'fr' ? 'nouvel onglet' : 'opens in a new tab'} /></div>
    </section>
    <Dialog open={selected !== null} onOpenChange={open => { if (!open) setSelected(null); }}>
      <DialogContent customLayout className="maps-gallery-dialog pm8000-dialog" showCloseButton={false} onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); changeImage(event.key === 'ArrowLeft' ? -1 : 1); }
      }}>
        <div className="gallery-heading"><DialogTitle>Profometer PM8000 Pro</DialogTitle><DialogClose className="gallery-close" aria-label={text.close}><Image unoptimized src="/assets/maps/close.svg" width={24} height={24} alt="" /></DialogClose></div>
        <DialogDescription className="sr-only">{language === 'fr' ? 'Utilisez les boutons ou les flèches du clavier pour changer d’image.' : 'Use the buttons or keyboard arrow keys to change images.'}</DialogDescription>
        {selected !== null && <figure className="pm8000-enlarged" aria-live="polite">{picture(selected, true)}<figcaption>{caption(selected)}</figcaption></figure>}
        <div className="pm8000-gallery-controls"><button onClick={() => changeImage(-1)}>{text.previous}</button><button onClick={() => changeImage(1)}>{text.next}</button></div>
      </DialogContent>
    </Dialog>
  </main>
 </>;
}
