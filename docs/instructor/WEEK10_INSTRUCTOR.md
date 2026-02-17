# Week 10 — Instructor Plan: API Calls + Loading States

> **This file is gitignored. Students should never see this.**

---

## At a Glance

```
SESSION     DURATION    FOCUS
────────    ────────    ─────
Day 1       2 hours     Mock API setup, Home screen fetch, loading + error states
            (separate day)
Day 2       2 hours     Courses list (pull-to-refresh), Course detail page, review pattern
```

Students leave Day 1 with a Home screen that fetches data from the mock API with loading and error states.
Students leave Day 2 with a fully dynamic courses list (pull-to-refresh) and a rich course detail page.

---

## Before Class (Day 1)

### What students already know (Weeks 1–9)

- TypeScript fundamentals (6 weeks of foundation), including async/await and try/catch
- File-based routing, Stack and Tab navigation (Week 7)
- `useState` for controlled inputs and form state (Week 8)
- `useEffect` for running code on mount (Week 9)
- Async functions inside `useEffect` (Week 9)
- Loading states with `ActivityIndicator` (Week 9)
- The storage utility pattern — a module with helper functions (Week 9)

### What's already on their machines

The app has 3 tabs. Home shows two hardcoded `AppCard` components. Courses shows a hardcoded FlatList. Course detail is a stub showing just the route parameter. Settings persists notifications and profile data.

### What's new this week

- **`error` state** — Students know `isLoading`. This week adds `error` as a third state variable. The four UI states (loading/error/empty/data) are the core concept.
- **`try/catch/finally`** — Students know `try/catch` from TypeScript. `finally` is new — "cleanup that always runs."
- **Extracted fetch functions** — In Week 9, async functions lived inside `useEffect`. Here they're extracted so retry + refresh can reuse them.
- **Pull-to-refresh** — FlatList's `refreshing` + `onRefresh` props. Separate `refreshing` state so data stays visible during refresh.
- **`ListEmptyComponent`** — FlatList's built-in empty state prop.

### Prep checklist

- [ ] Have the current app running on your machine so you can demo live
- [ ] Have the finished `lib/api.ts` ready but **don't show it yet** — build types and functions live
- [ ] Prepare a diagram or slide showing the four UI states: loading → data, loading → error → retry → loading
- [ ] Verify you can toggle `SHOULD_FAIL` in `api.ts` and demonstrate error states
- [ ] Have the finished `home.tsx` ready for reference

---

## Day 1 (2 hours) — Mock API + Home Screen + Error Handling

### Opening (10 min) — Demonstrate the Problem

Start by running the app and navigating through all screens.

**Say something like:**
> "Look at the Home screen. 'CPRG-216 Assignment due Friday.' Is that always true? What if today is Monday and the assignment was due last Friday? And '3/4 classes this week' — whose classes? This data is hardcoded. It's the same every time, for every student, on every day."

> "Go to the Courses tab. Same three courses — always. What if a student is enrolled in different courses? And tap on a course... all you see is the ID. Not very useful."

> "Every real app fetches its data from somewhere — an API, a database, a server. The data comes over the network, which means it takes time, and it might fail. Today and next class, we replace all this hardcoded data with async API calls. And we handle what happens when things go wrong."

**This is the motivation.** Students see that the current app is a prototype with fake data.

### Step 1 (15 min) — Introduce the Mock API Concept

**Don't write code yet.** Explain the architecture decision:

> "We're going to create a mock API — a file that pretends to be a network API. It uses `async/await`, it takes time (simulated with `setTimeout`), and it can fail (simulated with a toggle). Why not a real API? Campus WiFi can be flaky, free APIs don't have course data, and I want us to focus on the React patterns, not debugging network issues."

> "Your component code will be identical to what you'd write with a real API. In Week 13, we'll swap the mock for Supabase, and the only change will be the function body — not the component that calls it."

**Draw the comparison:**

```
This week:                       Week 13:
const data = await               const { data } = await supabase
  api.getCourses();                .from("courses").select("*");

↓ Component code around it stays the same ↓
try/catch/finally, useState, useEffect, loading/error/data rendering
```

### Step 2 (25 min) — Build the Mock API Together

Live code `lib/api.ts`. Build it in this order:

**First, the types (5 min):**

```ts
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

**Teaching points:**
- `Course & { ... }` — "The `&` means 'everything in Course, plus these extra fields.' It's called an intersection type. We use it because `CourseDetail` is a `Course` with more stuff."
- "These types describe what the API returns. When you call `api.getCourses()`, you get back a `Course[]`. TypeScript knows the shape — autocomplete works, typos are caught."

**Second, the helpers (5 min):**

```ts
const SHOULD_FAIL = false;

function delay(ms: number = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function maybeThrow(): void {
  if (SHOULD_FAIL) {
    throw new Error("Network request failed. Please check your connection.");
  }
}
```

**Ask:** "Why do we need a delay?" Answer: "Without it, the data appears instantly and the loading spinner is invisible. Real APIs take time — the delay lets us see and test our loading states."

**Third, the mock data (5 min):**

Paste in the data arrays. Don't type these letter by letter — paste them and walk through the structure. Emphasize:
- "These are just arrays and objects. In Week 13, this data lives in a database instead."
- "`COURSE_DETAILS` uses `...COURSES[0]` to copy the base fields. This is the spread operator."

**Fourth, the API functions (10 min):**

```ts
export async function getCourses(): Promise<Course[]> {
  await delay();
  maybeThrow();
  return COURSES;
}
```

**Walk through the flow:**
1. Call arrives → `await delay()` pauses for 800ms (simulates network)
2. `maybeThrow()` checks if `SHOULD_FAIL` is `true` → throws if yes
3. Returns the data

> "From the caller's perspective, this is indistinguishable from a real API call. It's async, it takes time, and it might throw. Your component doesn't know or care that the data is hardcoded underneath."

### Step 3 (10 min) — The Core Pattern (Whiteboard/Slide)

Before writing the Home screen, present the pattern that all three screens will follow:

```
State setup:
  const [data, setData] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

Fetch function (extracted, reusable for retry):
  async function loadData() {
    try {
      setError(null);
      setIsLoading(true);
      const result = await api.getSomething();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

useEffect on mount:
  useEffect(() => { loadData(); }, []);

Conditional rendering:
  if (isLoading) → spinner
  if (error)     → error message + retry button
  if (empty)     → empty state message
  else           → render data
```

**Key comparison with Week 9:**

> "Last week you had two states: `isLoading` and `data`. This week we add a third: `error`. Why? Because storage almost never fails — it's local. APIs fail all the time — the network drops, the server is down, the request times out. We need to handle that."

**Introduce `finally`:**

> "You know `try/catch`. `finally` is new — it's a block that runs no matter what. Whether `try` succeeds or `catch` runs, `finally` always executes. It's perfect for `setIsLoading(false)` because we always want to stop the spinner, whether the data loaded or an error occurred."

### Step 4 (30 min) — Build the Home Screen

Live code the changes to `home.tsx`. Build incrementally:

1. **Add imports** — `useEffect`, `useState`, `ActivityIndicator`, `Pressable`, `api`, `DashboardData`
2. **Add state variables** — `data`, `isLoading`, `error`
3. **Write `loadDashboard` function** — the full try/catch/finally pattern
4. **Add `useEffect`** — calls `loadDashboard` on mount
5. **Add loading state** — early return with `ActivityIndicator`
6. **Add error state** — cloud icon + message + "Try Again" button
7. **Update the data render** — dynamic data from `data?.greeting`, `data?.nextDeadline`, etc.

**After each major step, run the app:**

- After step 5: "See the spinner? It shows for about 800ms, then the data appears. That's the delay in our mock API."
- After step 6: Open `api.ts`, change `SHOULD_FAIL = true`, reload. "Now the Home screen shows the error state. Tap 'Try Again'..." Change `SHOULD_FAIL` back to `false`. "...and data loads normally."

**The error demo is the "wow" moment.** Students see the full lifecycle: loading → error → retry → loading → success.

### Step 5 (15 min) — Explain `try/catch/finally` in Depth

After the Home screen works, zoom in on the pattern:

**Show what happens without `finally`:**

```tsx
// Without finally — buggy
try {
  setIsLoading(true);
  const result = await api.getDashboard();
  setData(result);
  setIsLoading(false);  // Only runs on success
} catch (e) {
  setError(e.message);
  // isLoading is still true! Spinner shows forever alongside error.
}
```

> "If the catch runs, `setIsLoading(false)` never executes. The spinner shows forever. You'd have to add `setIsLoading(false)` in both places. `finally` does this for you."

**Show what happens without `setError(null)` on retry:**

> "User sees error → taps Try Again → loadDashboard runs → error is still set from last time → the error state briefly flashes before loading clears it. That's why we clear it first."

### Day 1 Closing (15 min)

Run the full app. Walk through:
- Home: spinner → dynamic greeting + real data
- Toggle `SHOULD_FAIL = true` → Home shows error → tap "Try Again" (after toggling back) → works
- Settings: still works exactly as before (unchanged)
- Courses: still hardcoded (that's Day 2)

**Set up Day 2:**
> "The Home screen now fetches data and handles errors. Next class, we apply the exact same pattern to the Courses list — with two bonuses: pull-to-refresh and an empty state. And we'll build out the full Course Detail page. Same pattern, three times. By the end you'll have it memorized."

---

## Before Class (Day 2)

### Prep checklist

- [ ] Make sure the Day 1 code is working (Home fetches from API)
- [ ] Have the finished `courses/index.tsx` and `courses/[id].tsx` ready for reference
- [ ] Prepare to demonstrate pull-to-refresh (maybe have a slide showing the two-state approach)

### What students should have from Day 1

```
lib/
├── storage.ts                ← Week 9 (unchanged)
└── api.ts                    ← Mock API (NEW)

app/(tab)/
├── home.tsx                  ← NOW fetches from api.getDashboard()
├── courses/
│   ├── _layout.tsx           ← unchanged
│   ├── index.tsx             ← Still hardcoded (Day 2)
│   └── [id].tsx              ← Still a stub (Day 2)
└── settings/                 ← unchanged
```

---

## Day 2 (2 hours) — Courses List + Course Detail + Pull-to-Refresh

### Opening (10 min) — Recap Day 1

Quick interactive recap:

**Ask these out loud — let students answer:**
1. "What three state variables does every API screen need?" (`data`, `isLoading`, `error`)
2. "Why do we use `finally` instead of putting `setIsLoading(false)` inside `try` and `catch`?" (It runs no matter what — avoids duplication and forgetting)
3. "Why do we clear the error at the start of the fetch function?" (So the error state doesn't flash during retry)
4. "Why is the fetch function defined outside `useEffect`?" (So the retry button can call it too)

**Then show the Home screen working:** Spinner → data → toggle `SHOULD_FAIL` → error → Try Again → data. "Today we do the same thing for Courses, but with two new concepts."

### Step 6 (25 min) — Build the Courses List

Live code the changes to `courses/index.tsx`:

1. **Remove the `COURSES` constant** — "This was our hardcoded data. It's gone now."
2. **Add imports** — same pattern as Home
3. **Add state** — but with **four** variables: `courses`, `isLoading`, `refreshing`, `error`
4. **Write `loadCourses`** — same try/catch/finally pattern
5. **Write `handleRefresh`** — similar, but uses `refreshing` instead of `isLoading`
6. **Add `useEffect`**
7. **Add loading + error states**
8. **Update FlatList** — `data={courses}`, `refreshing`, `onRefresh`, `ListEmptyComponent`

**The new concept: `refreshing` vs `isLoading`:**

> "Why two different loading states? Watch what happens if I use `isLoading` for refresh..."

Demo (or explain): Setting `isLoading(true)` during refresh would trigger the full-screen spinner, hiding all the courses. The user expects to see their data while refreshing — just with a small spinner at the top.

> "`isLoading` = first load, shows full-screen spinner. `refreshing` = pull-to-refresh, shows small spinner above the list. Data stays visible."

**The new concept: `ListEmptyComponent`:**

> "FlatList has a built-in prop for what to show when the array is empty. Instead of writing `if (courses.length === 0) return <EmptyView />` before the FlatList, we pass it as a prop. FlatList handles it automatically."

**Demo pull-to-refresh:** Pull down on the courses list. The spinner appears at the top, the courses stay visible, then the data reloads.

### Step 7 (30 min) — Build the Course Detail Page

This is the biggest visual transformation. Live code `courses/[id].tsx`:

1. **Add imports** — `ScrollView`, `AppCard`, API imports
2. **Add state** — `course` (null), `isLoading`, `error`
3. **Write `loadCourse`** — calls `api.getCourseById(id!)`
4. **Add loading + error states** — same pattern
5. **Build the data render** — header (code + title + description), info cards, announcements

**Build the data render incrementally:**

First, just the header:
```tsx
<Text style={styles.code}>{course?.code}</Text>
<Text style={styles.h1}>{course?.title}</Text>
<Text style={styles.description}>{course?.description}</Text>
```

Run the app. "Look — we went from just showing 'cprg303' to showing the full course name and description."

Then add the info cards one by one. After adding instructor + schedule + room:
> "Notice we're reusing `AppCard` for everything. Same component from Week 7 — title, subtitle, optional right icon. It works for settings, courses list, and now course details."

Then add the announcements:
```tsx
{course?.announcements.map((text, index) => (
  <AppCard key={index} title={text}
    right={<Ionicons name="megaphone-outline" size={18} color={theme.colors.muted} />} />
))}
```

> "We map over the announcements array and render one card per announcement. `key={index}` is required by React — in a real app with a database, you'd use the announcement's ID instead."

**Demo the full flow:** Courses list → tap a course → spinner → full detail page with all info cards and announcements.

### Step 8 (15 min) — Full App Walkthrough

Run through the entire app, demonstrating all states:

1. **Home:** Spinner → dynamic greeting + data
2. **Courses:** Spinner → list with instructor names → pull-to-refresh → tap a course
3. **Course detail:** Spinner → full info (instructor, schedule, room, grade, deadline, attendance, announcements)
4. **Error state:** Toggle `SHOULD_FAIL = true` → all three screens show error → toggle back → "Try Again" → all work
5. **Settings:** Still works perfectly (unchanged)

> "Every screen follows the same pattern. Three state variables. try/catch/finally. Loading spinner. Error with retry. Data render. Once you know this pattern, you can fetch data from any API on any screen."

### Step 9 (15 min) — Review the Core Pattern

Show all three screens side by side (or on a slide). Highlight:

```
The API Fetch Pattern (used in ALL 3 screens):
──────────────────────────────────────────────
1. State: data + isLoading + error
2. Fetch function: try { setError(null); setIsLoading(true); fetch; setData } catch { setError } finally { setIsLoading(false) }
3. useEffect: calls fetch on mount
4. Render: if loading → spinner; if error → retry; if empty → message; else → data
```

**The courses list adds:**
```
5. refreshing state (separate from isLoading)
6. handleRefresh function (uses refreshing instead of isLoading)
7. FlatList props: refreshing + onRefresh + ListEmptyComponent
```

> "This pattern is the foundation of every data-driven screen in every React Native app. Instagram, Twitter, banking apps — they all do this. Loading spinner, error with retry, data display. You now know how to build it."

### Step 10 (15 min) — Student Challenge

Present the challenge from the student guide:

1. Toggle `SHOULD_FAIL = true` → verify all screens show error states
2. Toggle back → tap "Try Again" → verify recovery
3. Test pull-to-refresh on courses list
4. **Bonus:** Modify `delay()` to 2000ms → observe longer loading. Remove `delay()` → observe flash.
5. **Double Bonus:** Add random 30% failure rate to `maybeThrow()`

This is a verification + exploration challenge, not a coding challenge. Students should be confident that they can trigger and recover from errors on every screen.

### Day 2 Closing (10 min)

Zoom out and connect to the bigger picture:

> "Week 9 gave your app memory — data persists. Week 10 gave your app a voice — it talks to an API and handles what comes back. In Week 11, we add device hardware — camera and maps. And in Week 13, we swap this mock API for a real Supabase backend. The component code barely changes — the pattern you learned today carries forward."

**Quick knowledge check — ask these out loud:**
1. "What are the four UI states every fetch screen should handle?" (Loading, error, empty, data)
2. "Why do we use a separate `refreshing` state for pull-to-refresh?" (So existing data stays visible)
3. "What does `finally` do that `catch` doesn't?" (It runs whether the try succeeded OR the catch ran)
4. "Why is the fetch function defined outside useEffect?" (So retry and refresh can call it too)

---

## Troubleshooting During Class

| Student says... | Likely cause | Fix |
|----------------|-------------|-----|
| "The spinner shows forever" | Missing `finally` block, or `setIsLoading(false)` only in `try` | Move `setIsLoading(false)` to `finally` |
| "Error message doesn't go away when I retry" | Missing `setError(null)` at start of fetch function | Add `setError(null)` before `setIsLoading(true)` |
| "Pull to refresh shows full-screen spinner" | Using `isLoading` in `handleRefresh` instead of `refreshing` | Create separate `refreshing` state, use it in `handleRefresh` |
| "Course detail shows undefined for everything" | `CourseDetail` data not matching ID, or `id!` assertion on wrong value | Check that `COURSE_DETAILS` keys match the `id` values in `COURSES` |
| "TypeError: Cannot read property of null" | Data is null because loading/error checks are missing or in wrong order | Ensure `if (isLoading)` and `if (error)` return early before accessing data |
| "Import errors for api.ts" | Wrong relative path | From `home.tsx`: `../../lib/api`, from `courses/`: `../../../lib/api` |
| "TypeScript error on catch(e)" | Accessing `e.message` without checking type | Use `e instanceof Error ? e.message : "Something went wrong"` |
| "FlatList data is undefined" | `useState` initial value is `null` instead of `[]` | Use `useState<Course[]>([])` for array data |
| "Announcements don't render" | Missing `.map()` on the announcements array | Use `course?.announcements.map((text, index) => ...)` |
| "'Try Again' button doesn't do anything" | Fetch function defined inside `useEffect`, not accessible from JSX | Move function definition outside `useEffect` |

---

## Pacing Notes

### Day 1
- **If running ahead:** Have students add a `lastUpdated` timestamp to the Home screen that shows when the data was last fetched. This exercises state updates and template literals.
- **If running behind:** Skip the detailed `finally` explanation (Step 5). Students can read about it in the guide. Prioritize getting the Home screen working with loading + error states.
- **If students struggle with try/catch/finally:** Use a real-world analogy: "try to make a phone call; if it fails (catch), show an error; finally, put the phone down — whether the call connected or not."

### Day 2
- **If running ahead:** Have students add a "Last refreshed: X seconds ago" footer to the courses list that updates with each pull-to-refresh. This exercises formatting and state management.
- **If running behind:** Skip the course detail announcements section. Just build the header + info cards. Students can add announcements from the guide later.
- **If students struggle with pull-to-refresh:** Draw the two states on the board: "First load: nothing → spinner → data" vs "Refresh: data visible → small spinner → updated data." The visual makes the two-state approach click.

---

## Files students should have at the end of Week 10

```
lib/
├── storage.ts                ← Week 9 (unchanged)
└── api.ts                    ← Mock API (NEW)

app/(tab)/
├── home.tsx                  ← NOW fetches from api.getDashboard()
├── courses/
│   ├── _layout.tsx           ← unchanged
│   ├── index.tsx             ← NOW fetches from api.getCourses() + pull-to-refresh
│   └── [id].tsx              ← NOW fetches from api.getCourseById(id) — full detail page
└── settings/
    ├── _layout.tsx           ← unchanged
    ├── index.tsx             ← unchanged
    └── profile.tsx           ← unchanged
```

The `lib/` folder gains `api.ts`. Three screen files are modified. Settings is completely unchanged. The core pattern (state + fetch + useEffect + conditional render) is applied identically across all three screens, with the courses list adding pull-to-refresh and empty state handling.
