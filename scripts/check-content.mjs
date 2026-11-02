import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../content/case-studies/', import.meta.url).pathname;
const slugs = readdirSync(root).sort();
const seenOrders = new Set();
const errors = [];

for (const slug of slugs) {
  const folder = join(root, slug);
  const read = (name) => {
    const path = join(folder, name);
    if (!existsSync(path)) { errors.push(`${slug}: missing ${name}`); return {}; }
    try { return JSON.parse(readFileSync(path, 'utf8')); }
    catch (error) { errors.push(`${slug}/${name}: invalid JSON (${error.message})`); return {}; }
  };
  const meta = read('metadata.json');
  const en = read('en.json');
  const fr = read('fr.json');

  if (meta.slug !== slug) errors.push(`${slug}: metadata slug must match directory`);
  if (!meta.title?.trim()) errors.push(`${slug}: missing title`);
  if (!Number.isInteger(meta.order) || meta.order < 1 || seenOrders.has(meta.order)) errors.push(`${slug}: order must be a unique positive integer`);
  seenOrders.add(meta.order);
  if (!['published', 'hidden'].includes(meta.visibility)) errors.push(`${slug}: visibility must be published or hidden`);

  for (const [language, entry] of Object.entries({ en, fr })) {
    if (!meta.category?.[language]?.trim() || !meta.quote?.[language]?.trim()) errors.push(`${slug}: missing ${language} homepage text`);
    const sectionLabels = entry.sections ?? entry.labels;
    if (!Array.isArray(sectionLabels) || sectionLabels.length !== 5 || sectionLabels.some(label => typeof label !== 'string' || !label.trim())) errors.push(`${slug}/${language}: expected five section labels`);
    if (!entry.results?.title?.trim() || !Array.isArray(entry.results.items) || entry.results.items.length !== 3 || entry.results.items.some(item => !Array.isArray(item) || item.length !== 2 || item.some(text => typeof text !== 'string' || !text.trim()))) errors.push(`${slug}/${language}: expected a Results title and three complete results`);
  }
  if (JSON.stringify(Object.keys(en).sort()) !== JSON.stringify(Object.keys(fr).sort())) errors.push(`${slug}: English and French fields differ`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Content checks passed for ${slugs.length} bilingual case studies.`);
}
