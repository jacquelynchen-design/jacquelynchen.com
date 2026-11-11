import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PM8000 | Case study | Jacquelyn Chen',
  description: 'Designing an iPad inspection workflow for the Profometer PM8000 Pro: scan visualisation, data review and reporting.',
};

export default function PM8000Layout({ children }: { children: React.ReactNode }) { return children; }
