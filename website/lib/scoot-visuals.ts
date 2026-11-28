export const sectionIds = ['overview', 'research', 'design', 'testing', 'takeaways'] as const;
// Desktop screens sit in a window outline; mobile screens are pairs of 375 × 812 phone screens.
type Desktop = {kind:'desktop'; src:string; width:number; height:number; crop?:boolean};
type Phones = {kind:'phones'; screens:readonly string[]};
const phones = (id:string):Phones => ({kind:'phones', screens:[`/assets/scoot/${id}-a.png`, `/assets/scoot/${id}-b.png`]});
export const scootVisuals = {
  'job-board': {kind:'desktop', src:'/assets/scoot/job-board.png', width:1440, height:2356, crop:true} as Desktop,
  'skills-start': phones('skills-start'),
  'skills-select': phones('skills-select'),
  'skills-added': phones('skills-added'),
  'skills-results': phones('skills-results'),
  homepage: {kind:'desktop', src:'/assets/scoot/homepage.png', width:1440, height:686} as Desktop,
};
export type ScootVisualId = keyof typeof scootVisuals;
// Gallery follows the order the images appear on the page.
export const galleryIds = ['job-board', 'skills-results', 'skills-start', 'skills-select', 'skills-added', 'homepage'] as ScootVisualId[];
