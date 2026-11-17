# PeerConnect visual redesign — Graphite Campus

## Audit and intent

The original authenticated homepage spent its first viewport on a greeting, a large lavender promotion and numerical cards. Community activity appeared well below those sections. Its pale surfaces, uniform bordered cards and administrative navigation gave little sense of campus identity.

The redesign changes the composition and shared visual language while keeping the existing product scope. The authenticated landing page is now Campus Home: a compact greeting and a prominent image-led news row, the existing post composer, category filters and interactive campus posts take the main column. The discovery rail displays actual project recommendations, application/team details, notifications and people with shared skills. No activity counts or announcements are fabricated.

## Design system

| Token                | Dark appearance |
| -------------------- | --------------- |
| Canvas               | `#101213`       |
| Navigation           | `#141718`       |
| Cards                | `#191C1E`       |
| Elevated surfaces    | `#252B2D`       |
| Main text            | `#F2F3EF`       |
| Secondary text       | `#A5ADAD`       |
| Borders              | `#303638`       |
| Quiet blue-gray text | `#BDD1D5`       |
| Primary button       | `#E5E9E5`       |
| Skill emphasis       | `#94C5BD`       |

Inter remains bundled locally. Headings are compact and editorial; body copy stays readable. Avatar colors are deterministic presentations of the existing initials, not uploaded or generated identities. A custom orbital SVG connects the wordmark, project covers, profile header and empty states.

`app/midnight.css` defines the redesign after the existing base stylesheet. The default is dark; the existing saved light preference and Settings switch remain functional, with a header shortcut to the same local preference. Light mode has its own coordinated surfaces and category/status colors.

## Screens

- Campus Home prioritizes the feed. Faculty-highlighted posts are shown first within the fetched page; normal posts retain their existing chronology. Filters and pagination call the existing posts API. No new ranking or recommendation service is introduced.
- Project discovery uses category-specific abstract covers, existing skill badges, creator details and clear calls to action.
- Candidate cards present the unchanged match percentage in a circular indicator, with existing listed, matched and missing skill information.
- Profiles use an orbital cover and stronger personal information hierarchy. Professional links and profile editing remain connected.
- Messages use layered chat surfaces. Applications, teams, notifications, moderation and administration share the same typography, controls and status language.
- The public landing and authentication screens share the identity and campus photography.

## Photography and attribution

Two archive photographs by **Ayush.undefined**, dated 13 September 2011, are stored locally in their original form:

- [Thapar University Illuminated](https://commons.wikimedia.org/wiki/File:Thapar_University_Illuminated.jpg)
- [Thapar Campus Aerial View](https://commons.wikimedia.org/wiki/File:Thapar_Campus_Aerial_View.jpg)

Both are licensed [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). CSS crops/overlays are described in the in-app photo credits. The photographs and any adapted photographic presentation retain that license. The images are archival, with no claim of current construction, official events or university endorsement. `public/images/CREDITS.txt` supplies the author, sources and license, and is linked from the interface.

## Interaction and accessibility

Navigation and controls have restrained hover/press feedback. Cards use a short slide without text opacity fading; matching progress bars animate from the left. Reduced-motion preferences disable transitions and animations. Relative post timestamps retain exact dates in semantic time elements and tooltips.

Desktop uses navigation, a conversation column and a discovery rail. On tablet the discovery content follows the feed. Mobile has a compact header, an off-canvas menu, touch-friendly controls and a single conversation column. The first viewport includes the actual community post content rather than a statistics dashboard.

## Scope integrity

No authentication, role, database, application, capacity or team rules changed. SHA-256 comparisons confirmed that `lib/auth.ts`, `lib/db.ts`, `lib/matching.ts`, `lib/service.ts`, `lib/validation.ts` and `prisma/schema.prisma` were unchanged from the redesign baseline. No migrations, social networks, reaction types, saved posts or new backend endpoints were added.

Presentation assertions in the existing tests now target the new Campus Home heading and layout. The same underlying state, authorization, scoring and persistence assertions remain. The screenshot helper waits for feed skeletons as well as the page loader, so saved screenshots represent loaded content. New checks cover first-viewport content, category filtering, mobile navigation, light preference persistence and light-theme accessibility. See the executed redesign results in TEST_REPORT.md.

## Graphite refinement

The final pass follows the supplied Reddit and Spotify references: neutral navigation and surfaces, ivory actions, restrained blue, sage, amber and coral details, and reduced decorative emphasis. Campus news & updates links to actual existing announcement, event and academic posts. Archive photos are explicitly labeled and are not presented as event photography. On phones this row scrolls horizontally inside the page. The large promotional header was removed to keep the feed in the first viewport.

## Later reliability audit — 13 November 2026

The visual-only scope statements above describe the earlier redesign. The later authorized frontend/backend audit adds a health endpoint, a dedicated authenticated highlights query and input/error handling fixes. No scoring, role or team-capacity rules changed. See LATEST_STATUS.md for final current status.

## Obsidian color refinement — 13 November 2026

The latest user direction keeps the accepted layout and asks for deeper black backgrounds, inspired by the supplied Spotify/Reddit references, with vibrant color reserved for selected details. The neutral foundation is now canvas #080808, navigation #050505, cards #141414, elevated controls #202020, borders #292929 and off-white text #F5F5F5. Coral #FF7849 marks primary actions, the active navigation indicator and small brand/activity details. Green #67DF9A marks match percentages; blue, amber and pink identify selected content categories/artwork. Large gray-tinted gradients were removed from homepage cards; photography carries the strongest visual variety. Dark-theme overrides are scoped so the saved light alternative remains usable. Public/authentication screens share the black foundation and coral actions.

This is a stylesheet-only product change. Layout, stored data, roles, matching and application workflows are unchanged. Browser screenshots are refreshed in docs/screenshots. Verification results are recorded in OBSIDIAN_THEME_REPORT.md.
