# Reliable 6–8 minute demo

Prepare the local database and seed first. Keep two browser sessions (normal and private) so student and faculty accounts stay separate. All accounts and announcements are fictional demo content. Use the password configured as DEMO_PASSWORD in the local environment.

| Time      | Show                                                                                   | Talking point                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0:00–0:40 | Public landing                                                                         | “PeerConnect helps the Thapar community turn individual skills into shared projects.”                                                                                   |
| 0:40–1:20 | Login student.a@thapar.edu; dashboard; edit profile                                    | Show Python, ML, React, SQL and required profile fields. Save without clearing skills.                                                                                  |
| 1:20–2:05 | Discover Projects; Smart Attendance System                                             | Explain required skills and team capacity, then apply with a short introduction.                                                                                        |
| 2:05–3:00 | Faculty session: faculty@thapar.edu; Manage Projects; Smart Attendance; Find Teammates | Point to Candidate A 100%, B 75%, C 50%. Explain exact overlap formula and missing skills. Open Systems Lab Explorer to demonstrate the no-match state if time permits. |
| 3:00–3:50 | Faculty reviews Candidate A and accepts                                                | Show team update. Creator occupies one of four positions. Reject another pending applicant if desired.                                                                  |
| 3:50–4:20 | Student notifications and My Teams                                                     | Status, notification and membership persist in PostgreSQL.                                                                                                              |
| 4:20–5:15 | Campus Community                                                                       | Create a text post, like/unlike, add a comment. Refresh to show persistence.                                                                                            |
| 5:15–6:00 | Open Mira Kapoor’s linked research announcement                                        | Follow Accessible Learning Lab to the actual opportunity. The community feeds into the same application workflow.                                                       |
| 6:00–6:45 | Student profile → Message, or seeded faculty conversation                              | Send a message; switch session and allow up to five seconds for polling. Show unread/read behavior.                                                                     |
| 6:45–7:30 | Optional moderator/admin and responsive view                                           | Report a post, review as moderator; show faculty approval in admin. Conclude with the matching and transactional team design.                                           |

## Local accounts

Student A: student.a@thapar.edu. Faculty: faculty@thapar.edu. Student B/C: student.b@thapar.edu, student.c@thapar.edu. Additional students: student.x@thapar.edu and student.y@thapar.edu. Moderator: moderator@thapar.edu. Admin: admin@thapar.edu. All use DEMO_PASSWORD (example local value in .env.example). Never reuse these credentials in a real deployment.

## Viva prompts

- Why deterministic matching? Explainable exact baseline requirement; no subjective weights.
- Why PostgreSQL transactions? Acceptance changes several related facts and must not overfill under concurrent requests.
- Why normalized skills? Shared identity, duplicate prevention, consistent comparison.
- Why pending faculty approval? An institute email does not prove a privileged role.
- Why one listing table with a research extension? Shared discovery/application behavior without duplicate logic.
- What is new? Post interactions/categories, integrated announcements and audience rules; the basic feed already existed in FR-21.
- What is excluded? Task boards, video, followers, AI matching and multi-university onboarding.

## Recovery

If matching appears empty, check that the selected project has required skills and student profiles exist. If the database connection fails, restart the local database helper before the app. Seed is safe to rerun for fixtures but preserves existing decisions; use a fresh local database directory for a pristine demonstration rather than unexpectedly overwriting applications. Automated tests add visibly named test fixtures; they can be run against a separate PostgreSQL database for presentation cleanliness.
