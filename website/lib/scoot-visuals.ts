export const sectionIds = ['overview', 'research', 'design', 'testing', 'takeaways'] as const;
export const scootVisuals = {
  homepage: {src:'/assets/scoot/homepage.png', width:1440, height:686},
  'job-board': {src:'/assets/scoot/job-board.png', width:1440, height:2356},
  'skills-start': {src:'/assets/scoot/skills-start.png', width:1064, height:1067},
  'skills-select': {src:'/assets/scoot/skills-select.png', width:1064, height:1067},
  'skills-added': {src:'/assets/scoot/skills-added.png', width:1064, height:1067},
  'skills-results': {src:'/assets/scoot/skills-results.png', width:1064, height:1067},
};
export type ScootVisualId = keyof typeof scootVisuals;
export const galleryIds = Object.keys(scootVisuals) as ScootVisualId[];
