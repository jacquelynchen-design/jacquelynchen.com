export const sectionIds = ['overview', 'research', 'design', 'testing', 'takeaways'] as const;
// Pairs show the same screen on desktop (1440 × 1024 crop) and mobile (390 × 844 crop), each in a device outline.
type Pair = {kind:'pair'; desktop:string; mobile:string};
type Component = {kind:'component'; src:string; width:number; height:number};
const pair = (id:string):Pair => ({kind:'pair', desktop:`/assets/scoot/${id}-desk.png`, mobile:`/assets/scoot/${id}-mob.png`});
export const scootVisuals = {
  homepage: pair('homepage'),
  'career-finder-old': {kind:'component', src:'/assets/scoot/career-finder-old.png', width:1990, height:590} as Component,
  'job-board': pair('job-board'),
  'job-description': pair('job-description'),
  'skills-start': pair('skills-start'),
  'skills-results': pair('skills-results'),
  'skills-callout': {kind:'component', src:'/assets/scoot/skills-callout.png', width:400, height:118} as Component,
};
export type ScootVisualId = keyof typeof scootVisuals;
// Gallery follows the order the images appear on the page.
export const galleryIds = Object.keys(scootVisuals) as ScootVisualId[];
