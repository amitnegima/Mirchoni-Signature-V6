# Mirchoni Resorts Signature V6 — AI-enhanced Visual Edition

A lightweight HTML/CSS/vanilla-JavaScript website with **local** bundled photographs, original uploaded images, seven AI-enhanced interpretations, responsive WebP sizes, PWA installability, offline shell, and WhatsApp booking enquiries.

## Upload to Vercel

1. In Vercel, choose to create a new project via **Deploy** or upload using [Vercel Drop](https://vercel.com/drop).
2. Upload **the extracted folder contents** or the provided ZIP (when ZIP upload is supported).
3. Set framework to **Other**, leave Build Command and Output Directory empty; `index.html` is at ZIP root.
4. Deploy to generate the Vercel URL. PWA installation needs HTTPS (Vercel provides it).

## Photos and content integrity

- Seven `assets/img/ai/*.webp` images are AI-enhanced visualizations created from user-supplied photographs; lighting and details have been artistically adjusted. **Not documentary evidence of the exact property or cottage type.**
- Seven `assets/img/real/*.webp` assets are optimized copies of user-uploaded original resort photographs. Copies are preserved alongside AI visuals for an honest editorial gallery.
- All critical image assets are hosted within the ZIP; the website **does not request Mirchoni.com for image display**.
- Keep real and AI images labeled, and ask the property's owner to approve before official publication.
- Rate figures, policies and availability should always be confirmed with the resort. The booking action creates a WhatsApp enquiry only; there is no live room inventory or payment flow.

## Technical notes

- PWA entry: `manifest.webmanifest`, `sw.js`, `offline.html`, app icons.
- Main interactive homepage: `index.html` with `assets/js/cinematic.js`.
- Original informational pages: `stays.html`, `story.html`, `experiences.html`, `gallery.html`, `contact.html` plus cottage details.
- `assets/js/image-manager.js` prevents broken images and delays swapping until photos decode.
- Animations honor reduced-motion settings; no invisible pointer (OS cursor stays visible).
- The first hero is preloaded; additional responsive WebP images lazy-load on scroll and cache after first use. Offline access is partial: previously viewed content and critical pages are supported; WhatsApp needs internet.

## What must be verified after deployment

Check `index.html`, all cottage links, gallery lightbox, contact form, real-device PWA installation, browser back/forward, reduced motion, image loading on slow 4G, and Lighthouse metrics. Static tests do not guarantee field performance.
