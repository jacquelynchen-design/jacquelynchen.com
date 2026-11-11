# Jacquelyn Chen — Portfolio prototype

Responsive homepage implemented from Figma node 367:2156, with mobile layout 370:231.

## Local development

Run `npm install`, then `npm run dev`. Run `npm run build` for production.

## Editing the portfolio

- `app/page.tsx`: biography, project list, navigation, and preview interactions.
- `app/globals.css`: Figma color tokens and desktop/tablet/mobile layout.
- `app/layout.tsx`: title, description, and fonts.
- `public/assets`: original downloaded Figma imagery and icons.

## Language, appearance, and downloads

The EN/FR button switches all homepage copy except the English headline. The main résumé link downloads the selected language; the footer always offers both original PDFs. Copy and résumé mapping are in `lib/portfolio-copy.ts`. The language and appearance choices are stored locally through `lib/use-preference.ts`. The supplied New Spirit Condensed Regular and Regular Italic fonts are self-hosted in `public/fonts`. The headline uses the true Regular Italic face without synthesized italics. Contact links use her email and LinkedIn profile.

## Maps case study

The Maps card opens `/case-study/maps`. Five sticky section anchors track the reading position. The four delivery-gallery items open in a desktop dialog or mobile bottom sheet; thumbnails and left/right arrow keys select the image. Escape, the close button, or a backdrop click dismisses the gallery. Shared navigation, downloads, language, and appearance apply to both routes.

- `lib/maps-en.json` and `lib/maps-fr.json`: bilingual case-study content.
- `lib/maps-visuals.ts`: main visual mappings and four supporting-gallery visuals.
- `app/case-study/maps/page.tsx`: sections, active anchors, and gallery.
- `components/portfolio-shell.tsx`: shared header, footer, and preferences.

The current PNGs come from the revised portfolio Figma frame `367:2200` in `rJi7fhZSMBTaGAtMIC4e7J`. Eight captioned figures include both search states, comparisons, booking segments, recap, and the supplied design-system components. The design-system block follows the journey block. The four gallery images show connection options, the route map, a local map detail, and driver information. The same image manifest serves all devices. Figures use 8px corners and a soft border. Gallery captions are distinct descriptions of each visual because the Figma modal states repeat one search caption.

The mobile menu fills the screen beneath the header, with centered contact and résumé actions. It locks background scrolling and keyboard focus while open.

## Validation

Production build and TypeScript checks pass. App-specific lint checks are run separately; the generated, unused shadcn components have pre-existing lint findings. Local browser checks cover 390px mobile, 1024px tablet, and 1440px desktop layouts, thumbnail selection, arrow-key navigation, Escape dismissal, and the mobile menu in English/light and French/dark. The French menu résumé URL points to the French PDF.
