'use client';
import { usePortfolio } from './portfolio-shell';
export function CaseStudyCta({href,label,newTabLabel,iconSrc}:{href:string;label:string;newTabLabel:string;iconSrc?:string}){
 const {language}=usePortfolio(); const pdf=href.endsWith('.pdf');
 const name=pdf?(language==='fr'?'la proposition complète (PDF)':'the full proposal (PDF)'):new URL(href).hostname.replace(/^www\./,'');
 return <p className="conclusion-link">{language==='fr'?(pdf?'Découvrez ':'Visitez '):(pdf?'Explore ':'Visit ')}<a href={href} target="_blank" rel="noopener noreferrer">{name}<span className="external-link-icon" aria-hidden="true"/><span className="sr-only"> ({newTabLabel})</span></a>{language==='fr'?' pour en découvrir davantage.':pdf?' to see the full design.':' to see it for yourself.'}</p>;
}
