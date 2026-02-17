# Week 10: API Calls + Loading States

## Fetching Data and Handling the Loading → Success → Error Lifecycle

---

## Table of Contents

1. [Before vs After](#before-vs-after)
2. [Architecture Impact](#architecture-impact)
3. [New Concepts](#new-concepts)
4. [Step-by-Step Implementation](#step-by-step)
5. [Common Mistakes](#common-mistakes)
6. [Student Challenge](#student-challenge)

---

## Before vs After <a name="before-vs-after"></a>

### Before (Week 9)

```
Home tab
├── "Campus Hub" title
├── Hardcoded "CPRG-216 Assignment due Friday" card
└── Hardcoded "3/4 classes this week" card

Courses tab
├── "Your Courses" title
└── FlatList with 3 hardcoded items
    ├── CPRG-216 — Advanced Web Systems
    ├── CPRG-303 — Mobile Development
    └── CPRG-306 — Backend APIs
        └── Tap → Course detail page shows only the ID

Settings tab ← unchanged, already has persistence
```

Every screen shows the same data every time. The courses list is a constant array defined inside the component. The course detail page is a stub that just displays the route parameter. The home screen has fake strings. Nothing is fetched — nothing can fail, nothing can be empty, nothing can refresh.

### After (Week 10)

```
Home tab
├── Loading spinner → then:
├── Dynamic greeting ("Good morning — here's your overview")
├── Upcoming deadline card (from API)
└── Attendance summary card (from API)
├── OR: Error state with cloud icon + "Try Again" button

Courses tab
├── Loading spinner → then:
├── "Your Courses" title
├── FlatList with courses from API
│   ├── CPRG-216 — Advanced Web Systems — Prof. Sarah Chen
│   ├── CPRG-303 — Mobile Development — Prof. James Miller
│   └── CPRG-306 — Backend APIs — Prof. Amy Tran
│       └── Tap → Full course detail page (see below)
├── Pull down → refresh spinner → data reloads
├── OR: Error state with "Try Again" button
└── OR: Empty state ("No courses found.")

Course detail page
├── Loading spinner → then:
├── Course code + title + description
├── Info cards: instructor, schedule, room, grade, deadline, attendance
└── Announcements list
├── OR: Error state with "Try Again" button
```

Every screen now fetches data asynchronously. Every screen handles three states: loading, error, and data. The courses list supports pull-to-refresh. The course detail page shows real information instead of just an ID.

---

## Architecture Impact <a name="architecture-impact"></a>

### New File

```
lib/
├── storage.ts    ← Week 9 (unchanged)
└── api.ts        ← NEW: mock API with async functions
```

### Modified Files

```
app/(tab)/home.tsx              ← MODIFIED: fetches dashboard data from API
app/(tab)/courses/index.tsx     ← MODIFIED: fetches courses list from API
app/(tab)/courses/[id].tsx      ← MODIFIED: fetches course detail from API
```

### Updated Architecture Diagram

```
    app/_layout.tsx .................. Stack (Root)
        |
        └── app/(tab)/_layout.tsx ... Tabs
                |
                ├── home.tsx ........ fetches getDashboard() → loading/error/data
                |
                ├── courses/_layout.tsx .. Stack (Nested)
                |       |
                |       ├── index.tsx ... fetches getCourses() → loading/error/data + pull-to-refresh
                |       └── [id].tsx .... fetches getCourseById(id) → loading/error/data
                |
                └── settings/_layout.tsx . Stack (Nested)
                        |
                        ├── index.tsx ... (unchanged from Week 9)
                        └── profile.tsx . (unchanged from Week 9)

    lib/
    ├── storage.ts .................. Storage utility (Week 9)
    └── api.ts ...................... Mock API (NEW)
```

### Why a Mock API?

Campus WiFi can be unreliable. External APIs can go down mid-lecture. Free public APIs (like JSONPlaceholder) don't have course/campus data. The mock:

- Uses `async/await` and returns Promises — your component code is **identical** to what you'd write with a real API
- Has a configurable failure toggle for practicing error handling
- Gets replaced by Supabase in Week 13 with minimal component changes

```
Mock API (this week):                  Real API (Week 13):
─────────────────────                  ────────────────────
const result = await api.getCourses()  const result = await supabase
                                         .from("courses").select("*")

The component code around it stays the same:
  try { setIsLoading(true); ... setData(result); }
  catch (e) { setError(...); }
  finally { setIsLoading(false); }
```

---

## New Concepts <a name="new-concepts"></a>

### 1. The Fetch Lifecycle — Four UI States

In Week 9, you had two states: loading and data. Week 10 adds two more: error and empty. Every screen that fetches data must handle all four:

```
┌──────────────────────────────────────────────────────┐
│                  FETCH LIFECYCLE                      │
│                                                      │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐   │
│   │ LOADING  │ ──→ │ SUCCESS  │ ──→ │   DATA   │   │
│   │ (spinner)│     │          │     │ (render) │   │
│   └──────────┘     └──────────┘     └──────────┘   │
│        │                                             │
│        │  error occurs                               │
│        ▼                                             │
│   ┌──────────┐                      ┌──────────┐   │
│   │  ERROR   │ ── retry button ──→  │ LOADING  │   │
│   │ (message)│                      │ (spinner)│   │
│   └──────────┘                      └──────────┘   │
│                                                      │
│   If success but data is empty:                      │
│   ┌──────────┐                                      │
│   │  EMPTY   │                                      │
│   │ (message)│                                      │
│   └──────────┘                                      │
└──────────────────────────────────────────────────────┘
```

**The four states in code:**

```tsx
if (isLoading) return <ActivityIndicator />;       // State 1: Loading
if (error)     return <ErrorView onRetry={load} />; // State 2: Error
if (data.length === 0) return <EmptyView />;        // State 3: Empty
return <DataView data={data} />;                    // State 4: Data
```

**Why this order matters:** Loading is checked first because nothing else should render while data is in transit. Error is checked before empty because an error with an empty array is an error, not an empty state. Empty is checked before the data render to avoid showing an empty list.

### 2. The `error` State Variable

Week 9 used two state variables: `data` and `isLoading`. Week 10 adds a third: `error`.

```tsx
// Week 9 pattern (storage — errors unlikely)
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

// Week 10 pattern (API — errors expected)
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);  // ← NEW
```

`error` is `null` when there's no error, and a `string` message when something went wrong. The `<string | null>` type annotation tells TypeScript it can be either.

### 3. `try / catch / finally` — The Complete Error Handling Pattern

You already know `try/catch` from TypeScript. The `finally` block is new:

```tsx
try {
  // Code that might throw an error
  const result = await api.getCourses();
  setData(result);
} catch (e) {
  // Runs ONLY if an error was thrown
  setError(e instanceof Error ? e.message : "Something went wrong");
} finally {
  // Runs ALWAYS — whether try succeeded or catch ran
  setIsLoading(false);
}
```

**Why `finally`?** Without it, you'd need `setIsLoading(false)` in both the `try` block and the `catch` block. `finally` runs no matter what — it's perfect for cleanup that should always happen.

```
Without finally:                     With finally:
────────────────                     ─────────────
try {                                try {
  const data = await fetch();          const data = await fetch();
  setData(data);                       setData(data);
  setIsLoading(false);  ← here      } catch (e) {
} catch (e) {                          setError(e.message);
  setError(e.message);               } finally {
  setIsLoading(false);  ← and here    setIsLoading(false);  ← only here
}                                    }
```

### 4. Extracted Fetch Functions

In Week 9, async functions lived inside `useEffect`:

```tsx
// Week 9 — function defined inside useEffect (can only be called on mount)
useEffect(() => {
  async function loadProfile() {
    const saved = await storage.get("profile");
    // ...
  }
  loadProfile();
}, []);
```

In Week 10, the fetch function is defined outside `useEffect` so it can be called from multiple places:

```tsx
// Week 10 — function defined outside (reusable for retry + refresh)
async function loadCourses() {
  try {
    setError(null);
    setIsLoading(true);
    const result = await api.getCourses();
    setCourses(result);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
}

// Called on mount
useEffect(() => { loadCourses(); }, []);

// Called on retry button press
<Pressable onPress={loadCourses}><Text>Try Again</Text></Pressable>
```

**Why extract it?** The same function is used for the initial load (useEffect), the retry button (onPress), and pull-to-refresh (onRefresh). Defining it once avoids duplication.

### 5. Pull-to-Refresh

FlatList has built-in pull-to-refresh support with two props:

```tsx
<FlatList
  data={courses}
  refreshing={refreshing}      // boolean — shows the refresh spinner
  onRefresh={handleRefresh}    // function — called when user pulls down
  // ...
/>
```

**Why a separate `refreshing` state?** If we reused `isLoading`, pulling to refresh would hide all the existing data and show a full-screen spinner. With a separate `refreshing` boolean, the existing data stays visible while the refresh spinner appears at the top.

```tsx
const [isLoading, setIsLoading] = useState(true);    // full-screen spinner (first load)
const [refreshing, setRefreshing] = useState(false);  // pull-to-refresh spinner (reloads)

async function handleRefresh() {
  try {
    setRefreshing(true);
    setError(null);
    const result = await api.getCourses();
    setCourses(result);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setRefreshing(false);
  }
}
```

### 6. `ListEmptyComponent` — FlatList's Built-in Empty State

FlatList has a prop called `ListEmptyComponent` that renders when the `data` array is empty:

```tsx
<FlatList
  data={courses}
  ListEmptyComponent={
    <Text style={styles.emptyText}>No courses found.</Text>
  }
  // ...
/>
```

This is cleaner than adding a separate `if (courses.length === 0)` check before the FlatList. FlatList handles it automatically.

### 7. Real `fetch()` Syntax (Reference)

Our mock API hides the real HTTP syntax. Here's what a real API call looks like — you'll use this pattern when connecting to Supabase in Week 13 or any external API:

```tsx
// Real fetch() — for reference
async function getCourses() {
  const response = await fetch("https://api.example.com/courses");

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}
```

The key difference: real `fetch()` requires checking `response.ok` and calling `.json()`. Our mock returns the data directly. But the component code that calls the function — the `try/catch/finally`, the state management, the loading/error/data rendering — is identical.

---

## Step-by-Step Implementation <a name="step-by-step"></a>

### Step 1: Create the Mock API

**File:** `lib/api.ts`

Create a new file next to `storage.ts`:

```ts
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
```

**Breaking it down:**

| Type | What it represents |
|------|--------------------|
| `Course` | One item in the courses list — code, title, instructor, schedule, room, grade |
| `CourseDetail` | Everything in `Course` plus description, deadline, attendance, announcements |
| `DashboardData` | Home screen data — next deadline, attendance summary, greeting |

**`CourseDetail = Course &`** — The `&` is a TypeScript intersection type. It means "everything in `Course`, plus these additional fields." This avoids duplicating all the `Course` fields.

Next, add the helper functions:

```ts
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
```

| Helper | Purpose |
|--------|---------|
| `delay()` | Simulates network latency (800ms default). Without this, the spinner would flash too fast to see. |
| `maybeThrow()` | Throws an error when `SHOULD_FAIL` is `true`. Toggle it to test error states. |
| `getGreeting()` | Returns a time-based greeting. Shows that API responses can contain dynamic data. |

Next, add the mock data arrays — three courses with expanded fields. (This is just data — read through it to understand the shape, but don't worry about memorizing it.)

```ts
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
```

**`Record<string, CourseDetail>`** — A TypeScript utility type meaning "an object where keys are strings and values are `CourseDetail`." It's like a dictionary — you look up a course by its ID.

**`...COURSES[0]`** — The spread operator copies all fields from the `Course` object into the `CourseDetail`. This way we don't repeat `id`, `code`, `title`, etc.

Finally, the API functions themselves:

```ts
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
```

Each function: waits 800ms (simulates network), optionally throws (if `SHOULD_FAIL` is `true`), then returns the data. This is exactly what a real API call looks like from the component's perspective — it's async, it takes time, and it might fail.

---

### Step 2: Update the Home Screen

**File:** `app/(tab)/home.tsx`

Replace the entire file. The structure changes from a static component to one that fetches data on mount.

#### 2a. Imports and state setup

```tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { theme } from "../../styles/theme";
import * as api from "../../lib/api";
import type { DashboardData } from "../../lib/api";
```

**New imports:**
- `useEffect`, `useState` — React hooks for state and lifecycle
- `ActivityIndicator` — the loading spinner
- `Pressable` — for the retry button
- `* as api` — imports all exported functions from `api.ts` as `api.getCourses()`, `api.getDashboard()`, etc.
- `type { DashboardData }` — the TypeScript type for the dashboard response

#### 2b. State variables and fetch function

```tsx
export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setError(null);
      setIsLoading(true);
      const result = await api.getDashboard();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);
```

**Key points:**
- `setError(null)` at the start clears any previous error — important for retry
- `e instanceof Error ? e.message : "Something went wrong"` safely extracts the error message. If the thrown value isn't an `Error` object (it could be anything in JavaScript), we use a fallback message.
- `loadDashboard` is defined **outside** `useEffect` so the retry button can call it too

#### 2c. Loading and error states

```tsx
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }
```

The error state includes a cloud-offline icon, the error message text, and a "Try Again" button that calls `loadDashboard` again. This is the retry pattern — same function, called again.

#### 2d. Data state

```tsx
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Campus Hub</Text>
      <Text style={styles.p}>{data?.greeting} — here's your overview</Text>

      <AppCard
        title="Upcoming Deadline"
        subtitle={`${data?.nextDeadline.course} ${data?.nextDeadline.title} — due ${data?.nextDeadline.dueDate}`}
        right={
          <Ionicons name="alert-circle-outline" size={22} color={theme.colors.primary} />
        }
      />

      <AppCard
        title="Attendance"
        subtitle={`${data?.attendance.attended}/${data?.attendance.total} classes — ${data?.attendance.percentage}%`}
        right={
          <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.primary} />
        }
      />
    </View>
  );
}
```

**`data?.greeting`** — The optional chaining `?.` safely accesses properties even if `data` could be `null`. Since we check `isLoading` and `error` first, `data` will never actually be `null` here — but TypeScript doesn't know that, so `?.` keeps the compiler happy.

**Template literals in subtitles** — Instead of hardcoded strings like `"CPRG-216 Assignment due Friday"`, we build the subtitle dynamically from the API data using backtick strings.

---

### Step 3: Update the Courses List

**File:** `app/(tab)/courses/index.tsx`

The hardcoded `COURSES` array is removed. Data comes from `api.getCourses()`.

#### 3a. Imports and state

```tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/AppCard";
import { theme } from "../../../styles/theme";
import * as api from "../../../lib/api";
import type { Course } from "../../../lib/api";

export default function CoursesList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
```

**Four state variables:**

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `courses` | `Course[]` | `[]` | The list of courses from the API |
| `isLoading` | `boolean` | `true` | Full-screen spinner for first load |
| `refreshing` | `boolean` | `false` | Pull-to-refresh spinner (shows at top of list) |
| `error` | `string \| null` | `null` | Error message, or null if no error |

#### 3b. Two fetch functions

```tsx
  async function loadCourses() {
    try {
      setError(null);
      setIsLoading(true);
      const result = await api.getCourses();
      setCourses(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      setRefreshing(true);
      setError(null);
      const result = await api.getCourses();
      setCourses(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => { loadCourses(); }, []);
```

**Why two functions?** `loadCourses` sets `isLoading` (full-screen spinner). `handleRefresh` sets `refreshing` (small spinner at top of list). The difference is what the user sees during the fetch:

- First load: blank screen → full-screen spinner → data appears
- Pull-to-refresh: data stays visible → small spinner at top → data updates

#### 3c. FlatList with pull-to-refresh and empty state

```tsx
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Your Courses</Text>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No courses found.</Text>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/(tab)/courses/${item.id}`)}>
            <AppCard
              title={item.code}
              subtitle={`${item.title} — ${item.instructor}`}
              right={
                <Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />
              }
            />
          </Pressable>
        )}
      />
    </View>
  );
```

**Changes from Week 9:**
- `data={courses}` instead of `data={COURSES}` — dynamic instead of hardcoded
- `refreshing` + `onRefresh` — enables pull-to-refresh
- `ListEmptyComponent` — shows a message when the array is empty
- `item.code` + `item.title` + `item.instructor` — richer data from the API

---

### Step 4: Update the Course Detail Page

**File:** `app/(tab)/courses/[id].tsx`

This is the biggest transformation — from a stub that shows just the ID to a full detail page with multiple sections.

#### 4a. Imports and state

```tsx
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/AppCard";
import { theme } from "../../../styles/theme";
import * as api from "../../../lib/api";
import type { CourseDetail } from "../../../lib/api";
```

**New imports:** `ScrollView` (the page is long enough to scroll), `AppCard` (reused for each info card), the API module, and the `CourseDetail` type.

```tsx
export default function CourseDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadCourse() {
    try {
      setError(null);
      setIsLoading(true);
      const result = await api.getCourseById(id!);
      setCourse(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadCourse(); }, []);
```

**`id!`** — The `!` is a TypeScript non-null assertion. `useLocalSearchParams` can technically return `undefined`, but we know this page is only reached via navigation with a valid ID. The `!` tells TypeScript "trust me, this is not null."

#### 4b. Data rendering — header, info cards, announcements

The data state uses `ScrollView` because the content is too long for a single screen:

```tsx
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.code}>{course?.code}</Text>
      <Text style={styles.h1}>{course?.title}</Text>
      <Text style={styles.description}>{course?.description}</Text>

      {/* Info Cards */}
      <Text style={styles.sectionTitle}>Course Info</Text>

      <AppCard title="Instructor" subtitle={course?.instructor}
        right={<Ionicons name="person-outline" size={20} color={theme.colors.muted} />} />
      <AppCard title="Schedule" subtitle={course?.schedule}
        right={<Ionicons name="time-outline" size={20} color={theme.colors.muted} />} />
      <AppCard title="Room" subtitle={course?.room}
        right={<Ionicons name="location-outline" size={20} color={theme.colors.muted} />} />
      <AppCard title="Grade" subtitle={course?.grade}
        right={<Ionicons name="school-outline" size={20} color={theme.colors.muted} />} />
      <AppCard title="Next Deadline" subtitle={course?.nextDeadline}
        right={<Ionicons name="alert-circle-outline" size={20} color={theme.colors.primary} />} />
      <AppCard title="Attendance" subtitle={course?.attendance}
        right={<Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />} />

      {/* Announcements */}
      <Text style={styles.sectionTitle}>Announcements</Text>

      {course?.announcements.map((text, index) => (
        <AppCard key={index} title={text}
          right={<Ionicons name="megaphone-outline" size={18} color={theme.colors.muted} />} />
      ))}
    </ScrollView>
  );
```

**Reusing `AppCard`:** Every piece of information is displayed as an `AppCard`. The `title` is the label (e.g., "Instructor"), the `subtitle` is the value (e.g., "Prof. James Miller"), and the `right` prop is an icon. This keeps the UI consistent with the rest of the app.

**`course?.announcements.map()`** — Maps over the announcements array and renders one `AppCard` per announcement. The `key={index}` is required by React for lists (in a real app with stable IDs, you'd use the announcement ID instead of the array index).

---

## Common Mistakes <a name="common-mistakes"></a>

### 1. Forgetting to clear the error on retry

```tsx
// ❌ WRONG — error stays visible even during retry
async function loadCourses() {
  try {
    setIsLoading(true);
    const result = await api.getCourses();
    setCourses(result);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
}

// ✅ CORRECT — clear error before retrying
async function loadCourses() {
  try {
    setError(null);      // ← Clear previous error
    setIsLoading(true);
    const result = await api.getCourses();
    setCourses(result);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setIsLoading(false);
  }
}
```

Without `setError(null)`, if the first load fails and the user taps "Try Again," the error message stays on screen during the loading spinner (because we check `if (error)` before the data render). Clearing it first ensures the spinner shows cleanly.

### 2. Using `isLoading` for pull-to-refresh

```tsx
// ❌ WRONG — full-screen spinner replaces the course list during refresh
async function handleRefresh() {
  setIsLoading(true);  // Hides the data!
  const result = await api.getCourses();
  setCourses(result);
  setIsLoading(false);
}

// ✅ CORRECT — separate refreshing state keeps data visible
async function handleRefresh() {
  setRefreshing(true);  // Small spinner at top, data stays visible
  const result = await api.getCourses();
  setCourses(result);
  setRefreshing(false);
}
```

### 3. Not handling the error type safely

```tsx
// ❌ WRONG — error might not be an Error object
catch (e) {
  setError(e.message);  // TypeError if e is a string or undefined
}

// ✅ CORRECT — check first
catch (e) {
  setError(e instanceof Error ? e.message : "Something went wrong");
}
```

In JavaScript, `throw` can throw anything — strings, numbers, objects, not just `Error` instances. `instanceof Error` checks if the thrown value actually has a `.message` property.

### 4. Forgetting `finally`

```tsx
// ❌ WRONG — if catch runs, isLoading stays true forever
async function loadCourses() {
  try {
    setIsLoading(true);
    const result = await api.getCourses();
    setCourses(result);
    setIsLoading(false);  // Only runs on success
  } catch (e) {
    setError(e.message);
    // isLoading is still true! Spinner shows forever.
  }
}

// ✅ CORRECT — finally always runs
async function loadCourses() {
  try {
    setIsLoading(true);
    const result = await api.getCourses();
    setCourses(result);
  } catch (e) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setIsLoading(false);  // Always runs — loading ends no matter what
  }
}
```

### 5. Defining the fetch function inside useEffect (can't retry)

```tsx
// ❌ WRONG — loadCourses is scoped to useEffect, retry button can't call it
useEffect(() => {
  async function loadCourses() { /* ... */ }
  loadCourses();
}, []);

// Where does the retry button call loadCourses? It can't — it's not in scope.
<Pressable onPress={loadCourses}>  // ← ReferenceError!

// ✅ CORRECT — define outside useEffect
async function loadCourses() { /* ... */ }

useEffect(() => { loadCourses(); }, []);

<Pressable onPress={loadCourses}>  // ← Works!
```

### 6. Not importing the type separately

```tsx
// ❌ WRONG — imports the type as a runtime value
import { Course } from "../../../lib/api";

// ✅ BETTER — explicit type import (no runtime cost)
import type { Course } from "../../../lib/api";
```

`import type` tells TypeScript this import is only for type checking — it gets completely removed from the compiled JavaScript. It's not strictly required, but it's a best practice that makes your imports clearer.

---

## Student Challenge <a name="student-challenge"></a>

### Test Error States and Recovery

The mock API has a `SHOULD_FAIL` toggle at the top of `lib/api.ts`. Use it to practice the error → retry flow:

**Requirements:**

1. Open `lib/api.ts` and set `SHOULD_FAIL = true`
2. Reload the app — every screen should show the error state (cloud icon + error message + "Try Again" button)
3. Verify that all three screens (Home, Courses list, Course detail) show the error state correctly
4. Set `SHOULD_FAIL = false` and tap "Try Again" on each screen — data should load normally
5. On the Courses screen, test pull-to-refresh: pull down while data is displayed and observe the refresh spinner

**Bonus:** Modify the `delay()` function in `api.ts` to use a longer delay (e.g., 2000ms). Notice how the loading spinner is visible for longer. Then try removing the `delay()` calls entirely — notice how the spinner flashes so fast it looks like a glitch. This demonstrates why simulated latency is useful during development.

**Double Bonus:** Add a random failure mode to `maybeThrow()` so that errors happen unpredictably:

```ts
function maybeThrow(): void {
  if (SHOULD_FAIL || Math.random() < 0.3) {  // 30% chance of failure
    throw new Error("Network request failed. Please check your connection.");
  }
}
```

This simulates a flaky network. Try using the app with this enabled — it's the real-world experience your error handling is designed for.

---

*This guide builds on the `useEffect` and loading state patterns from Week 9. The new concepts are the `error` state variable, `try/catch/finally`, extracted fetch functions (for retry), pull-to-refresh, and `ListEmptyComponent`. Review `WEEK9_LOCAL_STORAGE.md` if you need a refresher on `useEffect` or `async` functions inside components.*
