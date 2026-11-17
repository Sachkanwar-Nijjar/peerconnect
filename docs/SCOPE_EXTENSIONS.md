# Scope and assumptions

## Original baseline

The report already includes messaging, notifications, a campus feed, moderation, and platform administration in FR-19–23. They are not reclassified as wholly new features. Its optional task/milestone tracking and portfolios are excluded, as directed by the master request. The isolated “Skill Exchange” use-case label has no numbered functional requirement or detailed story; skill discovery and direct messaging provide the collaboration route without inventing a marketplace.

## Approved extensions

EXT-01: categorized community feed, likes, comments, editing, deletion, and reporting.
EXT-02: highlighted faculty/admin announcements linked to actual projects/research opportunities.
EXT-03: persistent notifications for highlighted announcements to the author’s department and applicants to the linked opportunity; ordinary posts do not broadcast notifications.
EXT-04: responsive public landing page, role-aware dashboard, theme preference, shared visual system.
EXT-05: explicit faculty approval and configurable university domains.

## Design decisions

- Creators count as one position in project capacity; TeamMembership stores accepted additional students. Every capacity display includes the creator. Faculty mentors count too, providing one consistent rule.
- Application acceptance locks the project row inside a transaction, checks capacity, inserts membership, updates status, and notifies the applicant atomically. Rejection does not change membership.
- Students self-register. A faculty registration request produces an ordinary student account with a pending faculty flag; an administrator must assign FACULTY after checking eligibility outside the app. An email address alone proves neither faculty status nor administrator status.
- Institute email verification is mandatory. The development mailbox returns the verification link only when NODE_ENV is not production and DEV_EMAIL_VERIFICATION=true. Production requires SMTP configuration and does not return tokens.
- Profile skills, technologies, interests, experience, availability, name, department, and study year are required. Faculty profiles reuse these fields; interests are labeled as research interests.
- Skill labels are trimmed, lowercased, whitespace collapsed, and deduplicated. “Machine Learning” maps to “ml”. No other speculative aliases are used. Display capitalization is cosmetic. Score precision is retained in the API; UI rounds to a whole percentage.
- Candidate ties use name then ID. Zero-score students, disabled/unverified accounts and the creator are excluded. Matching is read-only. Recommended projects sort by exact overlap then shared interests; shared interests never modify the match percentage. People recommendations use shared profile skills.
- Project/research share the Project listing table. ResearchOpportunity adds a one-to-one department/details extension and requires faculty authorization, reducing duplicated workflows.
- Optional image and avatar uploads are omitted. Initials avatars and text-only posts are fully supported. The upload endpoint rejects uploads with HTTP 415; there is no unsafe file-storage shortcut.
- Moderator and Admin privileges are elaborated because the original SRS leaves the details to design. Moderator reviews/resolves reports and hides/restores reported posts. Admin additionally assigns roles and disables/enables accounts. Self-demotion/disable is prevented.
- Fictional content is labeled. No real society or university endorsement is claimed.

## Deliberate limits

No video, payment, followers, stories, marketplace, event RSVP, task boards, AI scoring or public deployment. Messaging uses five-second polling. The web page shows the latest 100 messages, while the API supports older pages. Classroom scale is the target; see README and TEST_REPORT for operational limitations.
