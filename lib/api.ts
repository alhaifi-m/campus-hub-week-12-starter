// Week 10: API Calls + Loading States — NEW file
// ─────────────────────────────────────────────────────────
// Mock API — simulates network requests with async/await
// Replace with real API (e.g., Supabase) in Week 13.
// ─────────────────────────────────────────────────────────

// ── Toggle this to force errors (for teaching error states) ──
const SHOULD_FAIL = false;

// ── Types ────────────────────────────────────────────────

export type Course = {
  id: string;
  code: string;
  title: string;
  instructor: string;
  schedule: string;
  room: string;
  grade: string;
};

export type CourseDetail = Course & {
  description: string;
  nextDeadline: string;
  attendance: string;
  announcements: string[];
};

export type DashboardData = {
  nextDeadline: { course: string; title: string; dueDate: string };
  attendance: { attended: number; total: number; percentage: number };
  greeting: string;
};

// ── Helpers ──────────────────────────────────────────────

function delay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeThrow(): void {
  if (SHOULD_FAIL) {
    throw new Error("Network request failed. Please check your connection.");
  }
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Mock Data ────────────────────────────────────────────

const COURSES: Course[] = [
  {
    id: "cprg216",
    code: "CPRG-216",
    title: "Advanced Web Systems",
    instructor: "Prof. Sarah Chen",
    schedule: "Mon/Wed 10:00 - 11:30",
    room: "T310",
    grade: "B+",
  },
  {
    id: "cprg303",
    code: "CPRG-303",
    title: "Mobile Development",
    instructor: "Prof. James Miller",
    schedule: "Tue/Thu 13:00 - 14:30",
    room: "S205",
    grade: "A-",
  },
  {
    id: "cprg306",
    code: "CPRG-306",
    title: "Backend APIs",
    instructor: "Prof. Amy Tran",
    schedule: "Wed/Fri 09:00 - 10:30",
    room: "N102",
    grade: "In Progress",
  },
];

const COURSE_DETAILS: Record<string, CourseDetail> = {
  cprg216: {
    ...COURSES[0],
    description:
      "Covers modern web frameworks, server-side rendering, and progressive web apps. Students build a full-stack web application using current industry tools.",
    nextDeadline: "Assignment 3 - Feb 21",
    attendance: "12/14 classes attended",
    announcements: [
      "Midterm grades posted — check your portal.",
      "Assignment 3 due date extended to Feb 21.",
      "Guest lecture next Wednesday: Industry panel on web performance.",
    ],
  },
  cprg303: {
    ...COURSES[1],
    description:
      "Introduction to cross-platform mobile development with React Native and Expo. Students build a campus utility app from scratch over 8 weeks.",
    nextDeadline: "Lab 10 - Feb 24",
    attendance: "14/14 classes attended",
    announcements: [
      "Week 10 guide is now available on D2L.",
      "Final project proposal due in 2 weeks.",
    ],
  },
  cprg306: {
    ...COURSES[2],
    description:
      "Designing and building RESTful APIs with Node.js and Express. Covers authentication, database integration, and API documentation with OpenAPI.",
    nextDeadline: "Project Milestone 2 - Feb 28",
    attendance: "10/14 classes attended",
    announcements: [
      "Office hours moved to Thursday 3-4 PM this week.",
      "API documentation workshop this Friday — bring your laptops.",
      "Milestone 1 feedback available in your repo.",
    ],
  },
};

const DASHBOARD: DashboardData = {
  nextDeadline: {
    course: "CPRG-216",
    title: "Assignment 3",
    dueDate: "Feb 21",
  },
  attendance: { attended: 36, total: 42, percentage: 86 },
  greeting: "", // filled dynamically
};

// ── API Functions ────────────────────────────────────────

export async function getCourses(): Promise<Course[]> {
  await delay();
  maybeThrow();
  return COURSES;
}

export async function getCourseById(id: string): Promise<CourseDetail> {
  await delay();
  maybeThrow();
  const course = COURSE_DETAILS[id];
  if (!course) {
    throw new Error(`Course "${id}" not found.`);
  }
  return course;
}

export async function getDashboard(): Promise<DashboardData> {
  await delay();
  maybeThrow();
  return { ...DASHBOARD, greeting: getGreeting() };
}
