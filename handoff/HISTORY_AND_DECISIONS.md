# History and decisions

1. The user supplied PeerConnect_mst_file.pdf, the Word test template, and a pasted master request. The original implementation read those requirements and recorded FR-01–25, BR-01–05, US-01–15 and TC-01–10 traceability.
2. A local full-stack app was implemented with PostgreSQL, not a static prototype. Tests, migrations, seed fixtures and academic demo documentation were delivered.
3. The user could not launch a .cmd by clicking its chat preview: that opened the source editor. A Windows launcher and Win+R instructions were supplied. Future handoffs must distinguish viewing code from running the file in File Explorer.
4. A later pasted visual transformation request asked for a dark, community-first experience while retaining all working business behavior. Campus Home replaced the old promotion/stat-card dashboard. All screens received shared dark/light styling, matching score rings and initials avatars.
5. The user explicitly authorized downloading Thapar campus photos. Two CC BY-SA Wikimedia archive images were bundled and credited.
6. Latest visual correction: the user disliked the purple-heavy AI appearance. Reddit/Spotify references prompted neutral graphite, ivory controls, varied restrained accents, simpler greeting/copy, prominent archive-image news tiles and mobile horizontal browsing. This is the visual baseline to preserve, even if an older prompt requests purple.
7. The current request is to compile everything and empower a fresh Codex conversation to inspect/improve the whole app. It expands the prior visual-only task: backend improvements can now be considered, but tested matching, permissions and team invariants still matter. It does not request immediate publishing or paid services.
8. The handoff is a portable source snapshot, not an exported Codex chat/session or a running executable. It includes reconstructed project knowledge, original files and verification evidence. Node dependencies/build products can be recreated. The live database was exported logically rather than copying running PostgreSQL files.

Do not assume remembered environment paths, running process IDs or browser handles will survive a new chat. Discover the new environment. Old reports saying servers were stopped refer to their run; preview availability is time-dependent.
