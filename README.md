# Jacquelyn Chen — portfolio content

This repository holds the content of the portfolio published at [jacquelynchen.com](https://jacquelynchen.com). The active content was checked against the live site's version 66 on 21 October 2026 (source commit `b6699601ae9578aa07b0287efd0945ad56de3c36`).

## Current content

- `content/site.json` contains the current English and French homepage copy.
- `content/case-studies/<slug>/metadata.json` contains each project's homepage title, order, category, quote, and visibility.
- `content/case-studies/<slug>/en.json` and `fr.json` contain the full published case-study content, including results.
- `content/schema/` documents the current content format.
- `scripts/check-content.mjs` checks that all seven published projects have complete bilingual content and valid metadata.

The seven current projects are Maps, The Manor, Santé, PM8000, Scoot, AbroadWise, and CaltexGo. Their order and visible text match the published site. Set `visibility` to `hidden` in a project's `metadata.json` when you later want to remove it from the homepage while keeping its content and direct page available. No project is hidden in this snapshot.

## Archive and site snapshot

The older Markdown CMS entries and schema remain in `archive/legacy-cms/`; they are historical reference, not current content. The original recovery notes remain in `archive/raw/` and `archive/RECOVERY.md`.

The live website is hosted separately from this repository. Editing these files alone does not publish a site change. The exact published source is identified by the version and commit above. Its full source archive and restoration instructions are in `backups/site-2026-10-21-v66/`.
