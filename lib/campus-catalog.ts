export type CampusEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  organizer: string;
  url: string;
  checkedAt: string;
};
// Schedule facts checked in the rendered official organizer schedule, 15 Nov 2026.
const days: Record<string, string> = {
  "2026-11-20": `MOVIE MAKING COMPETITION|12:00|Entire Campus|Cultural
Readathon|08:00|Library|Cultural
Robowar|20:00|OAT|Technical
Toast Tactics|22:00|LP 103/104|Cultural
Primus|22:00|CSED|Business`,
  "2026-11-21": `SatHack|11:00|CSED Ground Floor|Technical
Project Mewtwo|13:00|LP108 & LP109|Technical
WEST WALTZ WAR|10:00|Auxi Stage|Cultural
Quizathon|10:00|LP 107|Cultural
Designathon|11:00|Online|Technical
Money Ball|11:00|Online|Technical
Couture Crown|12:00|Online|Cultural
Synapse|12:00|LP 108|Technical
The Game of Minds: The battle for the Iron Throne|12:00|LP104|Technical
Strut Dynamite|12:30|Auxi Stage|Cultural
Canvas under canopy|13:00|New OAT|Cultural
SATWALK|19:00|Fete Area|Cultural
CADENCE|14:00|C hall|Cultural
CADathon|14:00|CSED Labs|Technical
Robo Soccer|14:00|LT Stairs|Technical
Star Wars|14:00|LP107|Technical
Street Crew Battle|15:00|Auxi Stage|Cultural
Mirage|16:00|LT 101, 102, 103|Technical
Hydro Grand Prix|16:00|Waterbody|Technical
Kaggle Wars|18:00|Online|Technical
Thapar MUN|21:00|TAN|Cultural
Emporia 4.0|22:00|T-202|Business
perplexed|22:00|LP 101 and 102|Business`,
  "2026-11-22": `Campus Photowalk|09:00|CSED Courtyard / Waterbody|Cultural
Amplify|10:00|Auxi Stage|Cultural
Passing Canvas|10:00|New OAT|Cultural
Somnium|11:00|Online|Technical
Through The Lens|11:00|Activity Space 1/2|Cultural
Album Cover Designing|11:00|Online|Cultural
Full Throttle|12:00|LP Lawns|Technical
Crescendo|12:00|New OAT|Cultural
Stupid Hack|12:00|LP108 & LP109|Technical
Obscura|12:00|AS 1/2|Technical
Micromouse|12:00|LT Stairs|Technical
Brush Rush|13:00|New OAT|Cultural
Silent Expressions|13:30|Main Auditorium|Cultural
Vibe2Fix|13:30|LP103|Technical
Vibe Coding Competition|14:00|LP101|Technical
CP Contest|15:00|CSED Labs (L002, L003, L004)|Technical
Battle of Bands|15:00|Auxi Stage|Cultural
Mini F1 Grand prix|15:00|Skywalk|Technical
Palette Play|15:00|New OAT|Cultural
Switch Skit|16:00|Main Audi / C-hall|Cultural
WILD WEST SHOWDOWN|17:00|Fete Area|Cultural
Sky Circuit|17:00|LP Lawns|Technical
Bhangra|18:00|Fete Area|Cultural
Wolf of dalal street|23:00|LT 101|Business
Micdrop|23:30|Auxi Stage|Cultural`,
  "2026-11-23": `Parley - British Parliamentary Debate|09:00|LP 101/102|Cultural
Lost Footage|10:00|C Hall|Cultural
Deal or No Deal|10:00|LP 103/104|Business
Ruhaniyat|11:00|Auxi Stage|Cultural
The Mentalist: Digital Deception|12:00|LP105|Technical
Brand Wars|13:00|LP 108 + 109|Business
One Stop Act|14:00|Main Audi|Cultural
Production wars (EDM)|15:00|Auxi Stage|Cultural
Color Riot|15:00|New OAT|Cultural
Aerosprint|15:00|Synthetic Track|Technical
Minecraft Engineering Challenge|15:00|Online|Technical`,
};
export const saturnaliaEvents: CampusEvent[] = Object.entries(days)
  .flatMap(([date, rows]) =>
    rows.split("\n").map((r, i) => {
      const [title, time, venue, category] = r.split("|");
      return {
        id: `sat-${date}-${i}`,
        title,
        time,
        venue,
        category,
        date,
        organizer: "Saturnalia",
        url: "https://www.saturnalia.in/events",
        checkedAt: "2026-11-15",
      };
    }),
  )
  .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
export const campusOrganizations = [
  {
    id: "saturnalia",
    name: "Saturnalia",
    type: "Festival",
    tag: "Music. Culture. Technology.",
    url: "https://www.saturnalia.in/",
    updates: "https://www.saturnalia.in/events",
    color: "gold",
  },
  {
    id: "virsa",
    name: "Virsa",
    type: "Culture",
    tag: "Punjabi culture & performance",
    url: "https://www.ssavirsa.in/",
    updates: "https://sites.google.com/thapar.edu/virsa/events",
    color: "coral",
  },
  {
    id: "ccs",
    name: "CCS",
    type: "Technology",
    tag: "Build, code & compete",
    url: "https://www.ccstiet.com/",
    updates: "https://hacktu.ccstiet.com/",
    color: "blue",
  },
  {
    id: "mars",
    name: "MARS",
    type: "Technology",
    tag: "Robotics & rover engineering",
    url: "https://marstiet.com/",
    updates: "https://in.linkedin.com/company/mars-tiet",
    color: "green",
  },
  {
    id: "acm",
    name: "ACM",
    type: "Technology",
    tag: "Computing & collaborative learning",
    url: "https://acmthapar.in/",
    updates: "https://orientation.acmthapar.in/",
    color: "blue",
  },
  {
    id: "fateh",
    name: "Team Fateh",
    type: "Motorsport",
    tag: "Formula Student Electric",
    url: "https://teamfateh.com/",
    updates: "https://teamfateh.com/",
    color: "coral",
  },
  {
    id: "venturelab",
    name: "VentureLab",
    type: "Entrepreneurship",
    tag: "From an idea to a startup",
    url: "https://venturelab.org.in/",
    updates: "https://venturelab.org.in/",
    color: "gold",
  },
];
export const campusResources = [
  {
    name: "Nava Nalanda Library",
    detail: "Books, e-resources, research support",
    url: "https://cl.thapar.edu/",
  },
  {
    name: "Book catalogue",
    detail: "Find your next read · Library OPAC",
    url: "https://library.thapar.edu/",
  },
  {
    name: "Past question papers",
    detail: "Library service · campus network may be required",
    url: "https://cl.thapar.edu/ques.php",
  },
  {
    name: "TSLAS",
    detail: "Liberal arts, sciences & campus life",
    url: "https://tslas.thapar.edu/",
  },
  {
    name: "Computer Science & Engineering",
    detail: "COE/CSE programmes, research & faculty",
    url: "https://csed.thapar.edu/",
  },
  {
    name: "Electronics & Communication",
    detail: "Department & academic resources",
    url: "https://eced.thapar.edu/",
  },
  {
    name: "Electrical & Instrumentation",
    detail: "Department & academic resources",
    url: "https://eied.thapar.edu/",
  },
  {
    name: "All student societies",
    detail: "Official institute society directory",
    url: "https://studentsocieties.thapar.edu/",
  },
];
export const campusUpdates = [
  {
    id: "sat26",
    org: "Saturnalia",
    type: "Festival",
    title: "Your November plans start here.",
    summary:
      "The main festival runs 21–23 November. Explore the published Day 0 schedule on 20 November, too.",
    url: "https://www.saturnalia.in/events",
    date: "2026-11-15",
    eventDate: "2026-11-21",
  },
  {
    id: "library-wiley",
    org: "Nava Nalanda Library",
    type: "Workshop",
    title: "Wiley author workshop & orientation",
    summary:
      "18 November 2026 · 3–5 pm · LT 201. The library lists an author workshop and orientation session.",
    url: "https://cl.thapar.edu/",
    date: "2026-11-15",
    eventDate: "2026-11-18",
  },
  {
    id: "hacktu8",
    org: "CCS",
    type: "Hackathon",
    title: "HackTU 8.0: start finding your team.",
    summary:
      "The organizer lists 6–7 February with 2027 edition branding. Check the organizer for registration, eligibility and updates.",
    url: "https://hacktu.ccstiet.com/",
    date: "2026-11-15",
    eventDate: "2027-02-06",
  },
  {
    id: "venture-open",
    org: "VentureLab",
    type: "Opportunity",
    title: "Have an idea you want to build?",
    summary:
      "Explore startup mentoring, programmes and funding support. Check application availability with VentureLab.",
    url: "https://venturelab.org.in/",
    date: "2026-11-15",
    eventDate: "",
  },
  {
    id: "virsa-culture",
    org: "Virsa",
    type: "Society",
    title: "Find your Punjabi culture community.",
    summary:
      "Discover Punjabi performance, cultural activities and organizer updates through Virsa’s own pages.",
    url: "https://www.ssavirsa.in/",
    date: "2026-11-15",
    eventDate: "",
  },
  {
    id: "acm-community",
    org: "ACM",
    type: "Society",
    title: "Learn it. Build it. Share it.",
    summary:
      "Explore computing workshops, collaborative projects and student learning resources through ACM Thapar.",
    url: "https://acmthapar.in/",
    date: "2026-11-15",
    eventDate: "",
  },
  {
    id: "fateh-build",
    org: "Team Fateh",
    type: "Society",
    title: "Engineering you can take to the track.",
    summary:
      "Meet the Formula Student Electric team and explore their cars, engineering story and team updates.",
    url: "https://teamfateh.com/",
    date: "2026-11-15",
    eventDate: "",
  },
  {
    id: "mars-rover",
    org: "MARS",
    type: "Society",
    title: "Meet the people building beyond the classroom.",
    summary:
      "Explore the robotics team’s rover and drone work. Their profile shares 2026 competition achievements; this is a team spotlight, not an upcoming event.",
    url: "https://in.linkedin.com/company/mars-tiet",
    date: "2026-11-15",
    eventDate: "",
  },
];
