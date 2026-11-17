# Requirements traceability

Original reference: PeerConnect_mst_file.pdf, SRS §3.2, business rules §3.6, and US-01–15. Test reference: Test Cases (Template Format).docx dated 28 October 2026. The implementation preserves these sources; this is a new implementation matrix, not an edited original report.

| Original ID | Behavior / story                                       | Implementation                                          | Verification                            |
| ----------- | ------------------------------------------------------ | ------------------------------------------------------- | --------------------------------------- |
| FR-01       | Institute registration · US-01                         | register route, allowlisted domains                     | TC-01                                   |
| FR-02       | Email verification before activation · US-01           | hashed single-use tokens, SMTP/development mailbox      | TC-01                                   |
| FR-03       | Login · US-02                                          | bcrypt, session service, logout                         | TC-02                                   |
| FR-04       | Create profile with all five baseline items · US-03    | profile service and form                                | TC-03                                   |
| FR-05       | View/update profile · US-03                            | profile view/edit routes                                | TC-03                                   |
| FR-06       | Student/faculty projects · US-04,05                    | project form/service, skill joins                       | TC-04                                   |
| FR-07       | Faculty research opportunity · US-05                   | faculty-only research extension                         | TC-05                                   |
| FR-08       | Browse/search/detail projects/research · US-07         | project/research listing queries                        | TC-05,08                                |
| FR-09       | Search people and collaboration profiles · US-07       | people name/skill/department discovery                  | UI walkthrough and authenticated API    |
| FR-10       | Compare required and declared skills · US-06           | lib/matching.ts                                         | TC-06, unit                             |
| FR-11       | Calculate exact match score · US-06                    | matchSkills                                             | TC-06, unit                             |
| FR-12       | Descending ranking with score/matching skills · US-06  | rankCandidates and candidate cards                      | TC-06, unit                             |
| FR-13       | No ranking with unusable requirements · US-06          | empty input guarded by pure matcher; project validation | unit and TC-07                          |
| FR-14       | Skill/interest recommendations · US-10                 | dashboard project relevance, people shared skills       | authenticated dashboard and UI review   |
| FR-15       | Student applications · US-08                           | student-only apply service/form                         | TC-09                                   |
| FR-16       | Pending status and creator notification · US-08        | atomic apply transaction                                | TC-09                                   |
| FR-17       | Creator review/accept/reject · US-09                   | owner-only decision service, applicant screens          | TC-10 and unauthorized action assertion |
| FR-18       | Status, notification, accepted team membership · US-09 | atomic decision transaction                             | TC-10, concurrent capacity test         |
| FR-19       | Direct messages · US-11                                | participant-scoped conversations/messages               | communication extension test            |
| FR-20       | Persistent notifications · US-12                       | bell/page, read markers                                 | TC-09,10, messaging test                |
| FR-21       | Feed and create posts · US-13                          | authenticated paginated community                       | campus persistence test                 |
| FR-22       | Report review/action · US-14                           | moderator review, hide/dismiss/restore                  | moderation test                         |
| FR-23       | Platform management · US-15                            | admin users/roles/faculty approval/disable              | admin authorization test and UI review  |
| FR-24       | Required-field validation                              | Zod at server boundary, native forms                    | TC-01–05 and validation tests           |
| FR-25       | Success/error feedback                                 | inline auth feedback, workspace alerts/toasts           | browser flows and negative assertions   |

| Original rule | Preservation                                                         |
| ------------- | -------------------------------------------------------------------- |
| BR-01         | Unverified login denied; private APIs and pages require verification |
| BR-02         | At least one project skill required; empty matcher gives no ranking  |
| BR-03         | Only creator accepts/rejects; admin status does not bypass ownership |
| BR-04         | Score limitations are stated on matching screens and documentation   |
| BR-05         | Experience/availability do not enter matcher; covered by unit test   |

| Added ID | Extension                                                       | Verification                                       |
| -------- | --------------------------------------------------------------- | -------------------------------------------------- |
| EXT-01   | Categories, likes, comments, own post editing/deletion, reports | persistence/ownership/moderation tests             |
| EXT-02   | Authorized highlighted announcement and real linked opportunity | faculty authorization/link navigation tests        |
| EXT-03   | Announcement audience scoped to department/linked applicants    | service policy and persisted notification data     |
| EXT-04   | Responsive landing, role dashboards, theme and cohesive UI      | viewport overflow check, browser visual review     |
| EXT-05   | Faculty approval, domain allowlist                              | server role assignment and research forbidden test |

NFR-01,08,10: labeled forms, keyboard focus styling, responsive CSS and browser viewport checks. NFR-02: classroom-sized bounded reads/pagination; no load or throughput benchmark claimed. NFR-03: error boundaries and explicit API errors. NFR-04: foreign keys, uniqueness and transactional teams. NFR-05,06: hashed passwords, private data and role/ownership checks. NFR-07: pure matching separated from service/data/view. NFR-09: exact deterministic fixtures.

DR-01/02: normalized profile/project skill joins. DR-03/04: foreign keys, uniqueness and server validation. DR-05: public profile projection excludes email/contact credentials. See TEST_REPORT for actual executed results; a verification mapping is not itself proof of a pass.
