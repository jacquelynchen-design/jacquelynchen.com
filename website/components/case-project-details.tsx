import type { ReactNode } from 'react';

export function CaseProjectDetails({ children, language = 'en' }: { children: ReactNode; language?: 'en' | 'fr' }) {
  return <aside className="case-project-details"><h2>{language === 'fr' ? 'Détails du projet' : 'Project details'}</h2><div className="case-project-details-content">{children}</div></aside>;
}
