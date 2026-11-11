'use client';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ProjectNavigation } from './project-navigation';
import { copy, resumeUrl } from '@/lib/portfolio-copy';
import { usePreference } from '@/lib/use-preference';
const PortfolioContext=createContext<{language:'en'|'fr';theme:'light'|'dark'}>({language:'en',theme:'light'});
export const usePortfolio=()=>useContext(PortfolioContext);
export const icon=(name:string)=><Image unoptimized className="icon" src={`/assets/${name}.svg`} width="24" height="24" alt="" aria-hidden="true" />;
const email='mailto:jacquelynchenwork@gmail.com';
export function PortfolioShell({children}:{children:React.ReactNode}) {
 const [menuOpen,setMenuOpen]=useState(false);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{
  const update=()=>setScrolled(window.scrollY>8);
  update();
  window.addEventListener('scroll',update,{passive:true});
  return()=>window.removeEventListener('scroll',update);
 },[]);
 const headerRef=useRef<HTMLElement>(null);
 useEffect(()=>{if(!menuOpen)return;const old=document.body.style.overflow;document.body.style.overflow='hidden';const content=document.querySelector('main');const footer=document.querySelector('footer');content?.setAttribute('inert','');footer?.setAttribute('inert','');const trap=(event:KeyboardEvent)=>{if(event.key!=='Tab')return;const els=Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a,button')??[]).filter(el=>el.getClientRects().length);const first=els[0],last=els.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}};const resize=()=>{if(window.innerWidth>800)setMenuOpen(false);};window.addEventListener('keydown',trap);window.addEventListener('resize',resize);return()=>{document.body.style.overflow=old;content?.removeAttribute('inert');footer?.removeAttribute('inert');window.removeEventListener('keydown',trap);window.removeEventListener('resize',resize);};},[menuOpen]);
 const [language,setLanguage]=usePreference('portfolio-language','en',['en','fr']);
 const [theme,setTheme]=usePreference('portfolio-theme','light',['light','dark']);
 const text=copy[language]; const dark=theme==='dark'; const pathname=usePathname(); const isCase=pathname.startsWith('/case-study/');
 useEffect(()=>{document.documentElement.lang=language;document.title=isCase?`${pathname.includes('/dr-presence')?'Dr Presence':pathname.includes('/manor')?'The Manor':pathname.includes('/sante')?'Service Trajet Santé':pathname.includes('/caltexgo')?'CaltexGo':pathname.includes('/scoot')?'Scoot Career Portal':pathname.includes('/abroadwise')?'AbroadWise':pathname.includes('/pm8000')?'PM8000':'Maps'} | ${language==='fr'?'Étude de cas':'Case study'} | Jacquelyn Chen`:text.title;},[language,text.title,isCase,pathname]);
 useEffect(()=>{document.documentElement.dataset.theme=theme;},[theme]);
 useEffect(()=>{const dismiss=(event:KeyboardEvent)=>{if(event.key==='Escape')setMenuOpen(false);};window.addEventListener('keydown',dismiss);return()=>window.removeEventListener('keydown',dismiss);},[]);
 return <PortfolioContext.Provider value={{language,theme}}><div className={`portfolio${dark?' night':''}${isCase?' case-site':''}`}>
 <a className="skip-link" href="#main">{text.skip}</a>
 <header ref={headerRef} className={`site-header${scrolled?' is-scrolled':''}${menuOpen?' menu-is-open':''}`}>
 <a href="/" onClick={()=>setMenuOpen(false)} className="brand" aria-label={text.home}><Image unoptimized src="/assets/imgLogo2.svg" width="185" height="32" alt="Jacquelyn Chen" /></a>
 <nav className="desktop-nav" aria-label={text.navigation}><a className="action" href={email}>{text.contact} {icon('imgMail')}</a><a className="action" href={resumeUrl(language)} download>{text.resume} {icon('imgDownload')}</a></nav>
 <div className="header-tools"><Button variant="ghost" className="language" aria-label={language==='en'?'Switch to French':'Passer en anglais'} title={language==='en'?'Passer en français':'Switch to English'} onClick={()=>setLanguage(language==='en'?'fr':'en')}>{language.toUpperCase()}</Button><Button variant="ghost" className="theme-button" aria-label={dark?text.light:text.dark} aria-pressed={dark} onClick={()=>setTheme(dark?'light':'dark')}>{icon('imgClearDay')}</Button><Button className="action menu-toggle" aria-label={menuOpen?text.closeMenu:text.openMenu} aria-expanded={menuOpen} aria-controls="mobile-menu" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<Image unoptimized className="icon" src="/assets/maps/close.svg" width={24} height={24} alt="" />:icon('imgMenu')}</Button></div>
 {menuOpen&&<nav id="mobile-menu" className="mobile-nav" aria-label={text.mobileNavigation}><a className="action" href={email} onClick={()=>setMenuOpen(false)}>{text.contact} {icon('imgMail')}</a><a className="action" href={resumeUrl(language)} download onClick={()=>setMenuOpen(false)}>{text.resume} {icon('imgDownload')}</a></nav>}
 </header>

{children}
 {isCase&&<ProjectNavigation/>}
 <footer className="footer" id="contact"><a className="email-link" href={email}><span>{text.email}</span><picture><source media="(max-width:700px)" srcSet="/assets/footer-arrow-mobile.svg" /><img className="footer-arrow" src="/assets/footer-arrow-desktop.svg" width="102" height="102" alt="" aria-hidden="true" /></picture></a><div className="footer-bottom"><nav aria-label={text.contactResume}><a href="https://www.linkedin.com/in/jjxchen" target="_blank" rel="noopener noreferrer">LinkedIn {icon('imgArrowOutward1')}</a><a href={resumeUrl('fr')} download lang="fr">Français - PDF {icon('imgArrowOutward1')}</a><a href={resumeUrl('en')} download lang="en">English - PDF {icon('imgArrowOutward1')}</a></nav><div className="footer-credit"><p>© Jacquelyn Chen 2026</p><p>{language==='fr'?'Créé avec Codex.':'Built with Codex.'}</p></div></div></footer>
</div></PortfolioContext.Provider>;
}
