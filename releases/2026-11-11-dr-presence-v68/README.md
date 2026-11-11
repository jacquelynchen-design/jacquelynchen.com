# Dr Presence publication update

This note supersedes the handoff's earlier local-only status for Dr Presence.

Published successfully on 11 November 2026 through the existing Sites project, preserving public access.

- Custom-domain page opened after deployment: https://jacquelynchen.com/case-study/dr-presence
- Deployment-returned base URL: https://jacquelyn-chen-portfolio.sdubois-jchen.chatgpt.site
- Sites version: 68
- Source commit in the Sites repository: `f2ac211a0dddcb7a8ebe86a0b68b5768df1b9732`
- Deployment ID: `appgdep_6af49d047d388191b5236c7c0414dab5`
- Project ID: `appgprj_6aa289d619348191a509da152eb4b547`

Built on the actual deployed v67 source (`5107f7106b6a6e5d68a5c11e9ec772697c5a0d97`), not the older main workspace snapshot. Publishing checkout: `/private/tmp/dr-presence-publish-20261111/.sites-checkout`. Temporary location, not a permanent backup. The Sites repository now contains the source commit.

Added only `app/case-study/dr-presence/`, its current runtime assets, and the Dr Presence document-title condition in the live shared shell. The route layout loads its Barlow Semi Condensed font. Old unused v4 GIF and static research-affinity image were omitted from the publication. Existing deployed homepage, shared CSS, root layout, footer, navigation and other pages were preserved. Full production build and TypeScript check passed. Desktop and mobile galleries were visually checked before publishing.

IMPORTANT: this pushed source to the Sites-managed repository, not the separate GitHub content repository. GitHub versioning directions still apply. Future publication must reopen the current Sites source rather than overwrite the live site with the older working application's unrelated shared files. The original local preview remains on port 8793; the temporary publication preview on port 8794 was stopped.
