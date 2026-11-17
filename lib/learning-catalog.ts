// Official TIET CSE 2026 scheme, checked 15 November 2026. Not all branches/batches.
export const sourceUrl =
  "https://www.thapar.edu/upload/files/BECSE2026_Scheme.pdf";
export const courseCatalog = [
  ["UCB009", "Chemistry", 1, 4],
  ["UES103", "Programming for Problem Solving", 1, 4],
  ["UES013", "Electrical & Electronics Engineering", 1, 4.5],
  ["UEN008", "Energy and Environment", 1, 2],
  ["UMA022", "Calculus for Engineers", 1, 3.5],
  ["UPH013", "Physics", 2, 4.5],
  ["UES101", "Engineering Drawing", 2, 4],
  ["UHU003", "Professional Communication", 2, 3],
  ["UES102", "Manufacturing Processes", 2, 3],
  ["UMA023", "Differential Equations and Linear Algebra", 2, 3.5],
  ["UCS303", "Operating System", 3, 4],
  ["UTA018", "Object Oriented Programming", 3, 4],
  ["UCS301", "Data Structures", 3, 4],
  ["UCS405", "Discrete Mathematical Structures", 3, 3.5],
  ["UTA016", "Engineering Design Project I", 3, 3],
  ["UMA021", "Numerical Linear Algebra", 3, 4],
  ["UCS320", "Introduction to Sustainable Green Computing", 3, 1],
  ["UCS415", "Design and Analysis of Algorithms", 4, 4],
  ["UCS310", "Database Management Systems", 4, 4],
  ["UCS414", "Computer Networks", 4, 4],
  ["UCS321", "AI for Engineers", 4, 3],
  ["UMA401", "Probability and Statistics", 4, 4],
  ["UTA024", "Engineering Design Project II", 4, 3],
  ["UML501", "Machine Learning", 5, 4],
  ["UCS420", "Cognitive Computing", 5, 3],
  ["UCS553", "Enterprise Web Application", 5, 4],
  ["UCS503", "Software Engineering", 5, 4],
  ["UCS510", "Computer Architecture and Organization", 5, 3],
].map(([code, title, semester, credits]) => ({
  code: String(code),
  title: String(title),
  semester: Number(semester),
  credits: Number(credits),
  branch: "Computer Science & Engineering",
  scheme: "CSE 2026",
  sourceUrl,
  checkedAt: "2026-11-15",
}));
export const facultyResources = [
  {
    title: "Computer Science & Engineering",
    url: "https://csed.thapar.edu/faculty",
  },
  {
    title: "Electronics & Communication",
    url: "https://eced.thapar.edu/faculty",
  },
  {
    title: "Electrical & Instrumentation",
    url: "https://eied.thapar.edu/faculty",
  },
];
export const helpTopics = [
  "Course selection",
  "Course preparation",
  "Exam strategy",
  "Skill guidance",
  "Placement / internship",
  "Project guidance",
] as const;
