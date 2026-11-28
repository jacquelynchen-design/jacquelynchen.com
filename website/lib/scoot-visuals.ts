export const sectionIds = ['overview', 'research', 'design', 'testing', 'takeaways'] as const;
// Desktop screens sit in a window outline; mobile screens are pairs of 390 × 844 phone screens.
type Desktop = {kind:'desktop'; src:string; width:number; height:number; crop?:boolean};
type Component = {kind:'component'; src:string; width:number; height:number};
type Phones = {kind:'phones'; screens:readonly string[]};
const phones = (id:string):Phones => ({kind:'phones', screens:[`/assets/scoot/${id}-a.png`, `/assets/scoot/${id}-b.png`]});
export const scootVisuals = {
  'job-board': {kind:'desktop', src:'/assets/scoot/job-board.png', width:1440, height:2456, crop:true} as Desktop,
  'skills-start': phones('skills-start'),
  'skills-results': phones('skills-results'),
  'career-finder-old': {kind:'component', src:'/assets/scoot/career-finder-old.png', width:1210, height:330} as Component,
  'skills-callout': {kind:'component', src:'/assets/scoot/skills-callout.png', width:400, height:118} as Component,
  homepage: {kind:'desktop', src:'/assets/scoot/homepage.png', width:1440, height:1040} as Desktop,
};
export type ScootVisualId = keyof typeof scootVisuals;
// Gallery follows the order the images appear on the page.
export const galleryIds = ['homepage', 'career-finder-old', 'job-board', 'skills-start', 'skills-results', 'skills-callout'] as ScootVisualId[];
