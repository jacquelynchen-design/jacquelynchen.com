'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { usePortfolio } from './portfolio-shell';
// Same order as the homepage cards; the switcher loops (first ← last, last → first).
const projects=[['dr-presence','Dr Presence'],['maps','Maps'],['pm8000','PM8000'],['scoot','Scoot Career Portal']];
export function ProjectNavigation(){
 const pathname=usePathname(); const {language}=usePortfolio();
 const index=projects.findIndex(([slug])=>pathname===`/case-study/${slug}`);
 if(index<0)return null;
 const previous=projects[(index+projects.length-1)%projects.length],next=projects[(index+1)%projects.length];
 return <nav className="project-navigation" aria-label={language==='fr'?'Parcourir les projets':'Browse projects'}>
 <a href={`/case-study/${previous[0]}`} aria-label={`${language==='fr'?'Projet précédent':'Previous project'}: ${previous[1]}`}><Image unoptimized src="/assets/project-previous.svg" width={56} height={56} alt=""/><span>{previous[1]}</span></a>
 <a href={`/case-study/${next[0]}`} aria-label={`${language==='fr'?'Projet suivant':'Next project'}: ${next[1]}`}><span>{next[1]}</span><Image unoptimized src="/assets/project-next.svg" width={56} height={56} alt=""/></a>
 </nav>;
}
