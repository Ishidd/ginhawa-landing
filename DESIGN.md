# Cinematic ginhawa landing page

The home route uses the app's indigo-and-mint theme with a cinematic atmosphere. Support, terms, privacy, account-deletion, and disclaimer pages share the cinematic reading layout and footer.

## Visual contract
- Background #05070D, surfaces #0E1524, text #F0F4FF, mint #B3E4BD, aquamarine #7DE2D1. Directional blue key light and mint phone-edge lighting preserve the cinematic night palette.
- Locally hosted Bricolage Grotesque, DM Sans, and IBM Plex Mono.
- Lowercase ginhawa branding, a desktop-first 1440px content frame, real screenshot phones, and original Chika artwork. Desktop rhythm uses 64–80px section spacing; mobile uses 40–52px.
- Footer groups Features under Product, Support resources under Community, and terms/privacy/account-deletion/disclaimer under Legal. Lowercase branding and capstone attribution remain.

## Motion
Phones follow a sine/cosine spatial arc over 850ms. Tap, swipe, buttons, and arrow keys select screens; theme changes preserve the selected feature.
A page-wide winding SVG draws to the reader’s viewport position and ends at the Download heading. Desktop routing moves right → center → left → right → center → left; cross-column sweeps use the open space between sections. Section nodes and the endpoint remeasure when FAQ expansion changes layout. The original adaptive Chika foreground follows the path as the progress marker; fewer, wider bends make the route calmer.
Offscreen sections reveal once with a slow fade, upward movement, and soft blur. FAQ circles turn mint while the vertical plus bar rotates away into a minus. Native details support keyboard interaction.
System reduced-motion preferences remove spatial movement and replace animated Chika with a matching still. No manual Pause motion control. The hero validation rosette carries the user-confirmed Guidance Associates validation; its diagonal shine loops every six seconds while visible and its pointer tilt is bounded.

## Assets and release state
All 18 supplied screenshots are retained as original JPEGs and optimized WebP copies. Chika uses the application's original animation. Fonts and licenses are local.
PUBLIC_APK_URL remains empty; the download area shows coming soon. A verified public HTTPS APK URL drives every download link and the generated QR when supplied.

## Desktop composition
The hero uses available width without stretching to a full 1080px screen. Purpose copy sits beside concise PSS-10, Kessler K6, and PSQ-20 summaries. The gallery introduction, theme switch, and four working feature shortcuts form a left column beside the 3D phone stage. The former three-step section is removed. Download uses a centered vertical stack on every screen size, followed by FAQ. Mobile keeps feature shortcuts in two columns and alternates the Chika tracker between both edges, crossing in the section gaps.

## Scroll-motion refinement
The gallery corridor now sits between its introduction and phone stage on desktop, avoiding a full left-to-right sprint. Crossings span 120px of vertical route space instead of 88px. Line, marker, and chapter states share one time-based eased distance with bounded local speed and faster catch-up for long jumps. Animation stops on settlement; reduced motion tracks scroll directly. The endpoint remains Download.

## Legal and support surfaces
All four legal destinations use the near-black palette, app fonts, mint links, and a shared footer. Long terms/privacy notices have a desktop contents rail and a mobile disclosure menu. Their app text is mirrored from lib/legal/legal_content.dart (31 October 2026) in src/data/legal.json; website-specific scope is stated separately. Support contacts are centralized in src/data/contacts.ts. The app support email and helpline-lookup-verified NCMH contact appear on the Support Resources page and shared footer.

## Personalized AI guidance
A concise section after the gallery explains assessment + stress factors + mood context. A procedural 3D neural sculpture uses the existing blue/mint palette, supports pointer and keyboard rotation, and animates only while visible. Studies, Relationships, and Finances switch clearly labeled illustrative suggestions; no AI request or personal-data storage is involved. Reduced motion presents a static model with manual controls. The shared scroll path includes the section and still ends at Download.

## Adaptive Guidance Orb replacement
The reference-led orb has a glossy mint/aqua core, three tilted orbital rings, fine light particles, curved dashed input paths, and faint circular guides. It inherits the navy, mint, and aqua palette. A repeating timer sequences Assessment, Stress factors, and Mood over 3.4 seconds, then pulses and rests before repeating; scrolling does not control it. Offscreen/hidden rendering and the timer pause. Drag rotates the assembly, tap pulses, the three input buttons select a ring and context description, and Reset view clears manual rotation. Arrow keys rotate, Enter/Space pulses, and R resets. The illustrative recommendation stays readable independently of the loop. Reduced motion keeps a completed static state with manual rotation and context controls. The WebGL module loads near the viewport, with a static SVG fallback. Initial marketing entries retain the 20 KB budget and the lazy 3D stack has a separate 1.4 MB raw budget.

### Orb shine and timed recommendation
The core has a stronger moving specular highlight, a small white hotspot, and an aqua reflected edge; the orbital rings are brighter. Assessment, Stress factors, and Mood use matching pill dimensions, typography, surfaces, and connection dots. The duplicate context list is removed. The single illustrative recommendation is now a navy popup beside the orb on desktop and below it on mobile. It reveals after the three timed inputs arrive, holds, then gently exits before the next loop. Focusing or choosing an example keeps the card open. The section timer remains active while the recommendation is in view; WebGL rendering still pauses when the orb itself is offscreen. Reduced motion and rendering failure keep the suggestion readable.

### Right-side output and layered core
The left column again contains the heading, description, three-input summary, boundary copy, and example selector. There is only one illustrative output: a timed popup on the right of the orb at desktop widths, with a short connecting line. At smaller widths it stacks beneath the model and aligns right. Label dots are removed entirely; the three input pills keep consistent sizing. The former plain sphere is replaced by a navy/teal flowing shader with luminous filaments, a Fresnel outer shell, and close orbital arcs. The desktop model shifts left within its canvas to leave genuine room for the output. Timer, pointer/keyboard controls, and reduced-motion behavior remain.

### Balanced AI scene spacing
On wide desktop, the 3D scene is centered between the personalized scroll-route node and the right viewport edge. Its outer insets match (approximately 47px at 1440px). The core no longer has a negative horizontal offset. The single illustrative popup sits at the upper right, inset 40px from the scene top to clear the fixed header when navigating directly to the section. Mobile retains its stacked layout.

### Shared section alignment below the hero
Purpose, Chika, screenshot gallery, AI guidance, FAQ, and Download share the same two-column reading rails on desktop. The right column uses the same balanced inset toward the central route and viewport edge. At 1440px, all six rows have left content bounds 102–531px and right content bounds 626–1378px. Chika's image/signature and copy now occupy those same columns as the sections above and below, with consistent vertical padding. The hero remains outside this rule. Tablet uses a shared narrower grid; mobile uses common 32px side insets and stacked content. Download has an inner shared wrapper so its lighting remains full-width.

The desktop/tablet Chika route now follows the measured center gap between the mascot and copy, matching the shared column spacing. Mobile retains its edge route to keep the stacked mascot and text clear.

### Visible reading-block spacing
Chika copy and the assessment list use centered 520px reading blocks inside the shared right column on wide desktop. At 1440px this gives each visible block approximately 163px of space toward both the route and right edge. The route is measured from the grid gap rather than a narrowed child, so centering text cannot shift the route. Assessment names and descriptions have an explicit 8px gap, consistent row padding, and a separate note. Chika’s link sits closer to its paragraph.

Wide-screen refinement: Chika copy and the assessment list now start with a bounded 24–48px inset inside the right column rather than being centered across all its unused width. This reduces the excessive route-to-copy gap at 1920px while keeping both blocks aligned and their reading measure at 520px.

### Centered FAQ
FAQ is exempt from the shared split-column layout: its heading sits above an 800px centered stack of disclosure cards, shrinking to the common 32px mobile insets. The desktop route travels along the outer left margin instead of through the section center; mobile retains the outer edge route. Existing plus/minus transitions and native keyboard disclosures remain.

Download precedes the centered FAQ. The route continues along the outer left margin through Download and ends beside the FAQ heading on desktop and mobile, keeping the centered content clear. Download is exempt from the shared split-column rails: its heading, action, version, and QR form one centered vertical stack. Copy is limited to the version and a short QR caption, or a single coming-soon line when no release is configured. Installation guidance remains in the download FAQ.

Gallery transitions wait for decoded screen images and keep the current theme until every replacement is ready. Social cards now match the cinematic navy/mint site, with current Chika and a real app screen at 1200×630.
