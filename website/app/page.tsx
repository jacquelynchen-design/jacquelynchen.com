'use client';
import Image from 'next/image';
import { IntroCards } from '@/components/intro-cards';
import { copy } from '@/lib/portfolio-copy';
import { usePortfolio, icon } from '@/components/portfolio-shell';
const projects=[

 {title:'Maps',art:'maps',category:['Mobility','Mobilité'],quote:['My car broke down and I want to go home','Ma voiture est en panne et je veux rentrer chez moi']},
 {title:'The Manor',art:'manor',category:['Branding','Identité de marque'],quote:['An identity for nourishment and wellbeing','Une identité autour de l’alimentation et du bien-être']},
 {title:'Service Trajet Santé',art:'sante',category:['Mobility','Mobilité'],quote:['I need to travel long distance to see a doctor','Je dois consulter un médecin loin de chez moi']},
 {title:'PM8000',art:'pm8000',category:['Data vis','Dataviz'],quote:['I need to report on structural damage','Je dois signaler des dommages sur une structure']},
 {title:'Scoot Career Portal',art:'scoot',category:['Job portal','Site carrière'],quote:['I want to work at Scoot Airways','J’aimerais travailler chez Scoot Airways']},
 {title:'AbroadWise',art:'abroadwise',category:['Branding','Identité de marque'],quote:['I’m building a brand for a study abroad consultancy','Je crée l’identité d’un cabinet de conseil en études à l’étranger']},
 {title:'CaltexGo',art:'caltexgo',category:['Logo','Logo'],quote:['We need an app icon design and guidelines','Il nous faut une icône d’application et des règles d’utilisation']},
];
const artwork=(name:string,width:number,height:number)=><Image unoptimized src={`/assets/projects/${name}`} width={width} height={height} alt="" loading="lazy" />;
function ProjectArt({kind}:{kind:string}) {
 switch(kind){
 case 'manor':return <Image unoptimized src="/assets/manor/thumbnail.png" width={1660} height={1298} alt="" loading="lazy" />;
 case 'maps':return artwork('imgLogo.svg',180,35);
 case 'sante':return <div className="sante-logo">{artwork('imgAmeliLogo1.png',144,39)}<span />{artwork('imgServiceTrajetSante.svg',109,44)}</div>;
 case 'pm8000':return artwork('imgImage18.png',272,204);
 case 'scoot':return artwork('imgLogo1.svg',132,132);
 case 'abroadwise':return <div className="abroad-logo">{artwork('imgVector.svg',32,32)}<div>{artwork('imgGroup1.svg',118,28)}{artwork('imgGroup.svg',79,32)}</div></div>;
 default:return artwork('imgImage19.png',176,120);
 }
}
export default function Home(){
 const {language}=usePortfolio(); const text=copy[language];
 return (
 <main id="main"><section className="hero" id="top" aria-labelledby="hero-title"><h1 id="hero-title" lang="en"><span>Complexity</span><span><em>into</em> Clarity</span></h1></section>
 <section className="practice" id="about" aria-label={text.about}><p className="intro">{text.intro}</p><IntroCards items={text.capabilities} /></section>
 <section className="work" id="work" aria-label={text.work}>{projects.map(project=><article className="project" key={project.art}><div className={`project-image project-art art-${project.art}`}><ProjectArt kind={project.art}/><span className="chip">{project.category[language==='fr'?1:0]}</span></div><div className="project-copy"><p className="project-quote">{language==='fr'?`«\u00a0${project.quote[1]}\u00a0»`:`“${project.quote[0]}”`}</p><h2>{project.title}</h2></div><a className="action project-action" href={`/case-study/${project.art}`} aria-label={`${text.explore}: ${project.title}`}>{text.explore} {icon('imgProperty1ArrowOutward')}</a></article>)}</section>
 </main>

);
}
