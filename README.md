# Jacquelyn Chen — portfolio

This repository holds source and content snapshots of the portfolio published at [jacquelynchen.com](https://jacquelynchen.com). The original content snapshot was checked against the live site's version 66 on 21 October 2026 (source commit `b6699601ae9578aa07b0287efd0945ad56de3c36`).

## Content snapshot from October 2026

- `content/site.json` contains the current English and French homepage copy.
- `content/case-studies/<slug>/metadata.json` contains each project's homepage title, order, category, quote, and visibility.
- `content/case-studies/<slug>/en.json` and `fr.json` contain the full published case-study content, including results.
- `content/schema/` documents the current content format.
- `scripts/check-content.mjs` checks that all seven published projects have complete bilingual content and valid metadata.

The seven projects in that content snapshot are Maps, The Manor, Santé, PM8000, Scoot, AbroadWise, and CaltexGo. Their order and visible text match the published site. Set `visibility` to `hidden` in a project's `metadata.json` when you later want to remove it from the homepage while keeping its content and direct page available. No project is hidden in that snapshot. Dr Presence is published by direct URL and has not been added to the homepage or this older bilingual JSON model.

## Archive and site snapshot

The older Markdown CMS entries and schema remain in `archive/legacy-cms/`; they are historical reference, not current content. The original recovery notes remain in `archive/raw/` and `archive/RECOVERY.md`.

The live website is hosted separately from this repository. Editing these files alone does not publish a site change. The exact published source is identified by the version and commit above. Its full source archive and restoration instructions are in `backups/site-2026-10-21-v66/`.

## Published source: version 68, 11 November 2026

`website/` contains the exact tracked application source published as Sites version 68, commit `f2ac211a0dddcb7a8ebe86a0b68b5768df1b9732`. It includes the Dr Presence case study, latest GIF and mascot imagery, mobile screen stacking and corner clipping. The deployed homepage source was preserved without changes.

- [Live Dr Presence case study](https://jacquelynchen.com/case-study/dr-presence)
- [Release notes](releases/2026-11-11-dr-presence-v68/README.md)
- [Source file checksums](releases/2026-11-11-dr-presence-v68/source-manifest.json)
- [Development and publishing instructions](website/DEVELOPMENT.md)

Dr Presence currently has English copy in `website/app/case-study/dr-presence/page.tsx`, not in the older bilingual content JSON. No French translation or new homepage card is included. The older content validator still checks the seven historical bilingual entries.

The source snapshot is for versioning and recovery. GitHub updates do not publish changes to Sites. Use the existing Sites project for deployment and reopen its latest source before editing.
