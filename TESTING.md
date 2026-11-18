# V5 verification checklist

1. On desktop hover links and inputs: native mouse pointer remains visible; decorative halo never prevents clicks.
2. Block all mirchoni.com image requests: hero, thumbnail circles, cottage cards and gallery still display bundled local WebP imagery.
3. After a verified photo loads, a fade overlay displays it; official photos are never fetched more than twice concurrently.
4. On mobile, reduced motion is honored; no extra page width.
5. On HTTPS or localhost, service worker pre-caches all local images and offline page navigation works after first visit.
6. Check calendar, gallery and cottage detail booking enquiry.
7. All synthetic visuals must be substituted with approved resort photography before public production use.


## V6.1 calendar regression testing — 18 November 2026

- Tested Chromium (inlined preview) at desktop 1440×900, mobile 390×844, short mobile 375×667.
- On 18 November 2026, days 1–17 are disabled, dates 18–30 remain clickable.
- November 18 check-in and November 19 check-out update both labels and open the guest counter.
- December 15 check-in and December 16 check-out work; check-out dates before check-in are disabled.
- November 30 → December 1 booking selection works.
- Calendar popover fits within the tested viewport heights and opens above the booking controls, avoiding hero overflow clipping.
- No JavaScript page errors observed in these tests.
- After deploying, check on real phones and ensure PWA service worker updates from previous V6.
