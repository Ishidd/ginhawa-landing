# Cinematic landing page verification

Latest pass: November 1, 2026. Changes are confined to StaticWebGinhawa; no deployment performed.

## Passed
- Production build: seven routes. Build check: 160 local references, no missing anchors or assets, CSP-compatible external scripts; browser JavaScript 9,506 bytes.
- Desktop 1280px: near-black background (#05070D), directional blue lighting, original mint accents, lowercase ginhawa branding.
- Validation rosette: pointer input updates its tilt; six-second diagonal shine runs while visible and pauses offscreen. Reduced-motion CSS disables these effects.
- Gallery: Next changes the focused screenshot and accessible announcement; visible caption removed. Navigation controls are centered.
- Refined scroll path uses the original adaptive foreground Chika icon. The endpoint reaches zero remaining dash offset at Download and stays outside the footer.
- 390px and 320px layouts: no horizontal document overflow. Mobile gutter keeps the Chika tracker clear of hero copy; footer groups fit.
- Footer contains Product / Features, Community / Support resources, and Legal / Terms of use, Privacy policy, Delete your account, Mental health disclaimer. Support resources navigation verified in browser; all route links checked against production output.
- Pronunciation definition, green-dot availability labels, visible gallery caption and Pause motion option are absent. System reduced-motion handling remains.
- Browser review: no warnings or errors.

## Preserved prior checks
Phone taps, swipe, previous/next and keyboard navigation retain the existing spatial arc. Dark/light screenshot mappings preserve feature identity. FAQ uses native disclosures with plus-to-minus feedback. Section reveals resolve once. OS reduced-motion emulation is unavailable in the browser tool; its source handling was inspected.

## Release limits
PUBLIC_APK_URL remains unset. Download area explains that the Android download and QR will appear when ready. Configured-download behavior still needs checking against the real public URL before release. Guidance Associates validation wording is supplied by the user and is distinct from clinical validation or deployment approval.

## Capture
.impeccable/review/cinematic/hero-refined.jpg

## Desktop spacing pass
- At 1920×1080, main content height changed from approximately 5,872px to 3,905px (about one third shorter), including the added assessment explanations and feature shortcuts.
- Hero 832px; purpose 496px; Chika 546px; gallery 792px; steps 430px; FAQ 492px; Download 317px.
- Checked 1920×1080 and 1366×768 Windows layouts, then 390px and 320px mobile layouts: no horizontal overflow.
- Feature shortcuts select the correct screen and update the accessible announcement (recommendations 7, history 8). Existing gallery controls and theme mapping remain.
- Final production build and link checks passed. Impeccable layout scan returned no findings. Browser error/warning log remained empty.
- Updated desktop capture: .impeccable/review/cinematic/desktop-spacing.jpg

## Page-wide route and concise-copy pass
- Winding SVG spans the full page. Desktop route: right → center → left → right → center → left; mobile alternates both edges and crosses in section gaps.
- PSQ-20 is included with 20 questions, verified against the existing app assessment metadata. All three assessment descriptions are concise.
- Removed the three-step section and its navigation target. Shortened section headings, supporting copy, and FAQ answers.
- Desktop 1440px and mobile 390px/320px checks: no horizontal overflow. Route endpoint stays at Download after FAQ expansion; remaining stroke dash offset reaches zero.
- Production build: seven routes, 156 checked local references, 9,935 bytes browser JavaScript. Build/link checks passed; no browser warnings/errors.
- Latest capture: .impeccable/review/cinematic/winding-route.jpg

## Scroll easing pass
- Replaced instant distance updates with time-based damping shared by the line, Chika marker, and nodes. Animation runs only until the scroll target is reached.
- Desktop gallery route uses the gap beside the phone stage, reducing the widest horizontal jump. Turns use 120px of vertical space instead of 88px.
- Browser samples confirmed intermediate drawing positions while scroll position stayed fixed, including backward scrolling. Mobile 390px: no horizontal overflow.
- Reduced-motion handling remains immediate. Resizes and FAQ layout changes remap directly to the new route.
- Final build/link check passed: seven pages, 156 references, 10,558 bytes browser JavaScript. No browser warnings or errors.

## Legal pages and shared support footer
- Terms & Conditions and Privacy policy mirror the current app notice sections, with separate website scope. Account deletion now publishes the app support email for recovery/follow-up; existing deletion scope and retention details remain. Mental health disclaimer references current optional AI handling.
- All four pages use InfoLayout and the same near-black palette and footer as the landing page.
- Footer and Support Resources publish the app support mailbox and the NCMH contact verified by the helpline tool. Contact links were inspected without initiating calls or email.
- Desktop 1440px: privacy, deletion, and disclaimer show the dark theme with no overflow. Mobile 390px: Terms contents disclosure and section navigation work. Support Resources fits at 320px. No browser warnings/errors.
- Production build and link checks passed: seven routes, 202 local references, 10,545 bytes browser JavaScript. Build guard now permits only the specifically approved support email.
- Latest captures: .impeccable/review/cinematic/privacy-updated.jpg and .impeccable/review/cinematic/footer-contacts.jpg.

## Personalized AI section
- Added a concise explanation of assessment + selected stress factors + mood context, qualified by AI being enabled. Examples are explicitly illustrative, not live AI output.
- Added a procedural 3D neural mesh with pointer rotation, arrow-key rotation, and R reset. Three factor buttons update both the example and highlighted model input.
- Verified Relationships and Finances examples, keyboard input, and model initialization. Reduced-motion and offscreen/hidden-tab loop cancellation are implemented.
- Checked 1440px desktop, 800px tablet, 390px and 320px mobile: no horizontal overflow. Scroll route includes the section without invalid path coordinates. Browser error/warning log is empty.
- Final production build and reference checks passed: seven routes, 211 local references, 15,082 bytes browser JavaScript (within the existing budget). No new dependencies or network services.
- Capture: .impeccable/review/cinematic/ai-guidance.jpg

## Adaptive Guidance Orb replacement
- Removed Explore recommendations and the procedural brain/neural mesh. Replaced it with the requested React Three Fiber + Three.js shader orb and GSAP ScrollTrigger choreography.
- Desktop reverse-scroll check: Assessment connected while Stress factors and Mood were pending; suggestion opacity was zero. Forward completion: all three connected and suggestion opacity reached one. The pulse runs once in real time on arrival, rather than remaining frozen at a scrubbed midpoint.
- Example factor buttons remain functional. Reduced motion presents the completed static state. Offscreen/hidden rendering is demand-based, and SVG fallback remains available.
- Mobile scroll timing uses the orb visual as its trigger; desktop uses the section. Initial marketing entry scripts: 13,168 bytes; lazy 3D renderer: 1,258,701 bytes. The renderer is imported near the viewport, not on initial page load.
- Production build and checks pass: seven routes, 210 local references. The large lazy chunk produces Vite’s expected size warning. R3F/Three also emits a Clock deprecation warning in development; no WebGL or application errors were observed.
- Latest capture: .impeccable/review/cinematic/adaptive-orb.jpg

- Narrow-screen confirmation at 320px: three inputs reached connected state, example opacity reached one, Relationships updated its suggestion, and there was no horizontal overflow or browser error.

## Reference orb redesign — 1 November 2026
- Rebuilt the procedural orb around the supplied animation: luminous mint/aqua core, three tilted rings, orbiting particles, curved dashed inputs, and subtle circular guides.
- Replaced ScrollTrigger choreography with a repeating timer; visibility pauses the sequence and renderer. The suggestion remains readable throughout.
- Browser checked at 1440×1000, 390×844, and 320×844. No horizontal overflow on mobile. Pointer drag, keyboard rotation/pulse, context selection, reset, and illustrative factor switching exercised; no browser errors observed.
- Reduced-motion code presents completed inputs and stops idle orb/particle animation; manual controls remain available. OS preference emulation was not exercised in this pass.
- Build and check-build passed: 7 routes, 210 local references. Initial marketing JavaScript 13,185 bytes; lazy 3D renderer 1,218,379 bytes, within its 1.4 MB budget. Vite's large lazy-chunk warning remains expected.
- Preview: .impeccable/review/cinematic/orb-reference-redesign.jpg.

## Orb shine, consistent inputs, recommendation reveal — 1 November 2026
- Inspected six frames of the supplied animated WebP, including its recommendation popup.
- Browser checked desktop 1440×1000 and mobile 390×844 / 320×844. All input controls share dimensions per breakpoint; no mobile horizontal overflow. Only one recommendation element exists.
- Observed the timed card in hidden and revealed states. Context selection updates its supporting description. Existing example chips remain the only example selector and pin the card on interaction.
- Build and check-build passed: 7 routes / 210 references, initial marketing JavaScript 13,185 bytes, lazy renderer 1,219,346 bytes. No application console errors in the inspected desktop/mobile session. Known Vite lazy-chunk size warning remains.

## Right popup and layered orb — 1 November 2026
- Desktop 1440×1000: one recommendation on the orb's right, example selectors restored on the left, flowing detailed core and luminous shell visible. Selected Studies and verified the output stays open.
- Mobile 390×844 and 320×844: card stacks below the orb, all content fits without horizontal overflow. No label-dot elements remain. Mood selection exercised; no application console errors observed.
- Production build and check-build passed: 7 pages, 210 references, initial marketing JavaScript 13,185 bytes; lazy renderer 1,220,776 bytes. Existing Vite lazy-chunk size warning remains.
- Preview: .impeccable/review/cinematic/orb-right-popup.jpg.

## Shared spacing below the hero — 1 November 2026
- Production build and check-build passed: 7 routes, 210 local references.
- Measured all six lower sections at 1440×1000: identical left and right column bounds; hero excluded from the shared layout. Visually inspected Chika with the gallery below it.
- Checked 1024×900, 390×844, and 320×844: no horizontal overflow. Mobile copy and Download align to the same 32px insets. No application console errors observed.
- Preview: .impeccable/review/cinematic/shared-section-spacing.jpg.

## Centered FAQ and reordered Download — 1 November 2026
Production build and check-build passed (7 routes, 210 references). Browser DOM confirms page order AI guidance → Download → FAQ, with Download the final of six route nodes and the SVG ending before FAQ. FAQ heading is above the centered 800px card stack, and native question expansion was exercised.

## Gallery decode readiness and current social preview — 1 November 2026
Hidden 3D phones used native lazy images; navigation could reveal them before decode. The gallery now warms DOM images within 700px, awaits decoded images before navigation, and swaps fully decoded theme images together. Revision checks cancel stale theme/navigation work; loading failure retains the current screen instead of exposing an empty replacement. Browser exercised nine next-screen actions and both themes: all 18 screenshot assets decoded with nonzero natural widths, no application errors. The Open Graph graphic uses the current navy/mint palette, real phone screen, current Chika, and lowercase brand. Versioned metadata points to social-preview-v2.png (1200×630); the old image URL is also refreshed. A reproducible optional Pillow generator is in scripts/generate-social-preview.py.
