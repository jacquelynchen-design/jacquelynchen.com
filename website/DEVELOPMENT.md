# Website development

This directory is a tracked-source snapshot of the published Sites version 68, source commit `f2ac211a0dddcb7a8ebe86a0b68b5768df1b9732`, saved on 11 November 2026. The root README in this directory came from that source and contains earlier project notes; this file and the repository-level release notes describe the current snapshot.

## Run locally

Requires Node >=22.13. From this directory:

```sh
npm ci
npm run dev -- --host localhost --port 8793
```

Choose another port if the original preview is still running.

```sh
npx tsc --noEmit
npm run build
```

The publishing checkout passed both checks. The source was checked on desktop and mobile, including dashboard galleries, image corners, navigation and Escape dismissal. Dependencies are pinned by the supplied lockfile; updating them is a separate change.

## Dr Presence

- Route and English copy: `app/case-study/dr-presence/page.tsx`
- Styles: `app/case-study/dr-presence/dr-presence.css`
- Metadata and route font: `app/case-study/dr-presence/layout.tsx`
- Assets: `public/assets/dr-presence/`
- Shared header, footer and titles: `components/portfolio-shell.tsx`

At <=700px the three dashboard images stack and open a three-item gallery. Desktop keeps the composite and four-item gallery. Current walkthrough is v10; do not reintroduce v4. Captions sit inside paper-coloured panels. Medication logs are self-reported, with missed and not-logged states distinct.

## Vercel (branch `claude/vercel-nextjs`)

On this branch the site runs on standard Next.js instead of vinext, Cloudflare and the Sites plugin, so it can be hosted on Vercel. Import the repository in Vercel with Root Directory set to `website`; Vercel detects Next.js and runs `npm install` and `next build`. Locally, `npm run dev` now starts `next dev`. The `main` branch still holds the Sites setup.

## Publishing

Hosting is Sites, not GitHub Pages. `.openai/hosting.json` retains the existing project identity. GitHub contains no build output, credentials or local runtime caches. Publishing requires the supported Sites workflow, not a GitHub push. Before editing for publication, open the latest Sites source to avoid overwriting newer work. Preserve access settings and homepage unless the user asks to change them.

Keep new revisions on `codex/` branches with focused commits. Run relevant checks and update release notes with the actual deployed version and source commit. Do not treat the historical content JSON as the active data source of the TSX page.
