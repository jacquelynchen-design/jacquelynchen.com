'use client';
import Image from 'next/image';
import { IntroCards } from '@/components/intro-cards';
import { copy } from '@/lib/portfolio-copy';
import { usePortfolio, icon } from '@/components/portfolio-shell';
import './home.css';

type Localised = readonly [en: string, fr: string];
const projects: { slug: string; title: string; image: [number, number]; category: Localised; quote: Localised; summary: Localised }[] = [
 {
  slug: 'dr-presence', title: 'Dr Presence', image: [896, 864],
  category: ['Telemonitoring', 'Télésurveillance'],
  quote: ['Could we do follow up visits remotely and reliably?', 'Et si les consultations de suivi pouvaient se faire à distance, en toute fiabilité ?'],
  summary: ['Facilitating remote reviews and data transmission between doctor and patient', 'Faciliter le suivi à distance et la transmission des données entre médecin et patient'],
 },
 {
  slug: 'maps', title: 'Maps', image: [900, 648],
  category: ['Mobility', 'Mobilité'],
  quote: ['My car broke down and I want to go home', 'Ma voiture est en panne et je veux rentrer chez moi'],
  summary: ['Aiding assistance operators help stranded travellers find a solution under time pressure.', 'Aider les chargés d’assistance à trouver une solution pour les voyageurs immobilisés, sous la pression du temps.'],
 },
 {
  slug: 'pm8000', title: 'PM8000', image: [1145, 834],
  category: ['Data visualisation', 'Visualisation de données'],
  quote: ['I need to report on structural damage', 'Je dois signaler des dommages sur une structure'],
  summary: ['Using a rebar detector device and iOS app, inspectors turn complex scan data into evidence they can review and use.', 'Avec un détecteur d’armatures et son application iOS, les inspecteurs transforment des données de scan complexes en preuves exploitables.'],
 },
 {
  slug: 'scoot', title: 'Scoot Career Portal', image: [1256, 640],
  category: ['Job portal', 'Site carrière'],
  quote: ['I want to work at Scoot Airways', 'J’aimerais travailler chez Scoot Airways'],
  summary: ['Organising and categorising jobs, allowing job seekers different ways to discover or identify a suitable opportunity.', 'Organiser et classer les offres pour donner aux candidats plusieurs façons de trouver le poste qui leur correspond.'],
 },
];

export default function Home(){
 const {language}=usePortfolio(); const text=copy[language]; const fr=language==='fr'?1:0;
 return (
 <main id="main" className="home">
  <section className="hero" id="top" aria-labelledby="hero-title"><h1 id="hero-title" lang="en"><span>Complexity</span><span><em>into</em> Clarity</span></h1></section>
  <section className="home-intro" id="about" aria-label={text.about}>
   <p className="intro">{text.intro}</p>
   <div className="home-work" id="work" aria-label={text.work} role="list">
    {projects.map(project=>{
     const href=`/case-study/${project.slug}`;
     return <article className={`home-project home-project-${project.slug}`} key={project.slug} role="listitem">
      <a className="home-thumb" href={href} tabIndex={-1} aria-hidden="true"><Image unoptimized src={`/assets/home/${project.slug}.webp`} width={project.image[0]} height={project.image[1]} alt="" loading="lazy" /></a>
      <div className="home-story">
       <span className="home-chip">{project.category[fr]}</span>
       <h2 className="home-quote">{fr?`« ${project.quote[1]} »`:`“${project.quote[0]}”`}</h2>
       <p className="home-summary">{project.summary[fr]}</p>
       <a className="action home-action" href={href}>{fr?'Découvrir':'Explore'} {project.title} {icon('imgProperty1ArrowOutward')}</a>
      </div>
     </article>;
    })}
   </div>
   <IntroCards items={text.capabilities} />
  </section>
 </main>
 );
}
