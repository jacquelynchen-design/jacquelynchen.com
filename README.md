# jacquelynchen.com content repository

Recovered and normalized portfolio content for Jacquelyn Chen.

## Structure

- `content/site.md` — homepage/profile content
- `content/case-studies/*.md` — normalized CMS entries
- `content/schema/case-study.schema.json` — machine-readable CMS contract
- `archive/raw/*.md` — minimally edited recovery notes and source text
- `archive/RECOVERY.md` — provenance, gaps, and ambiguity log

## CMS conventions

Each case study is Markdown with YAML front matter. The four standard sections are `problem`, `process`, `delivery`, and `takeaways`. Each section has an `enabled` flag, so a future renderer can omit it without deleting its content.

Interactive demos use `demo.type`:

- `figma` — an embedded Figma prototype URL
- `scrollable-screens` — an ordered list of mobile screen images in a scroll container
- `none` — no demo is currently available

Entries marked `recovery_status: summary-only` need author review before publication.

