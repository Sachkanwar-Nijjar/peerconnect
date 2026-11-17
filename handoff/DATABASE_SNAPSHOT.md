> Snapshot refreshed after the 13 November audit. All 17 table contents match the pre-audit original content. Prior restore verification remains applicable: schema and portable format are unchanged.

# Database snapshot

Exported at 2026-11-12T15:38:28.535Z (UTC ISO timestamp). This is the existing local application content at export, including demo/test artifacts. It is not a full chat export or a clean seeded database.

| Table | Rows |
| --- | ---: |
| User | 9 |
| Profile | 9 |
| Skill | 12 |
| ProfileSkill | 19 |
| Project | 5 |
| ResearchOpportunity | 1 |
| ProjectRequiredSkill | 13 |
| Application | 3 |
| Team | 5 |
| TeamMembership | 1 |
| Conversation | 1 |
| Message | 1 |
| Notification | 39 |
| CommunityPost | 4 |
| PostLike | 1 |
| PostComment | 1 |
| PostReport | 0 |

Sessions and verification tokens are deliberately excluded. User password hashes and application content are retained; keep the package private. Reauthentication is required after restore. No external service credentials are included.

Restore verification: applied the committed migration to a separate empty PostgreSQL database, restored with scripts/portable-data.mjs, checked all 17 model counts against this snapshot and confirmed zero sessions/tokens. Verification passed on 12 November 2026. The temporary verification database was removed. The original application content was not reset.
