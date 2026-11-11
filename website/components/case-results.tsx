import results from '@/lib/case-results.json';

export function CaseResults({ project, language, titleId }: { project: keyof typeof results; language: 'en' | 'fr'; titleId: string }) {
 const content = results[project][language];
 return <><h2 id={titleId}>{content.title}</h2><div className="takeaway-list">{content.items.map(([title, body]) => <div key={title}><h3>{title}</h3><p>{body}</p></div>)}</div></>;
}
