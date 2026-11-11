'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { usePortfolio } from './portfolio-shell';
const projects=[['maps','Maps'],['manor','The Manor'],['sante','Service Trajet Santé'],['pm8000','PM8000'],['scoot','Scoot Career Portal'],['abroadwise','AbroadWise'],['caltexgo','CaltexGo']];
export function ProjectNavigation(){
 const pathname=usePathname(); const {language}=usePortfolio();
 const index=projects.findIndex(([slug])=>pathname===`/case-study/${slug}`);
 if(index<0)return null;
 const previous=projects[(index+projects.length-1)%projects.length],next=projects[(index+1)%projects.length];
 return <nav className="project-navigation" aria-label={language==='fr'?'Parcourir les projets':'Browse projects'}>
 <a href={`/case-study/${previous[0]}`} aria-label={`${language==='fr'?'Projet précédent':'Previous project'}: ${previous[1]}`}><Image unoptimized src="/assets/project-previous.svg" width={72} height={72} alt=""/><span>{previous[1]}</span></a>
 <a href={`/case-study/${next[0]}`} aria-label={`${language==='fr'?'Projet suivant':'Next project'}: ${next[1]}`}><span>{next[1]}</span><Image unoptimized src="/assets/project-next.svg" width={72} height={72} alt=""/></a>
 </nav>;
}
