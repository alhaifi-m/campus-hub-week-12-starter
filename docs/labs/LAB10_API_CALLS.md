# Lab 10: API Calls + Loading States

## Objective

Build a "Campus Events" feature — an events list screen, an event detail screen, and an upcoming event card on the Home screen — all fetched from the mock API. Apply the same `try/catch/finally` pattern, loading/error/empty states, and pull-to-refresh you learned in the Week 10 guide, but with new data you build yourself.

---

## What You Already Have

After completing the Week 10 guide, your app has:

- A **mock API** (`lib/api.ts`) with `getCourses()`, `getCourseById()`, and `getDashboard()`
- **Home screen** that fetches dashboard data with loading/error states
- **Courses list** that fetches courses with pull-to-refresh and empty state
- **Course detail** that fetches individual course data with loading/error states
- Patterns for: `try/catch/finally`, extracted fetch functions, `refreshing` state, `ListEmptyComponent`

You will be **extending** the mock API and **building new screens** that follow the same patterns.

---

## Scenario

The campus wants to show upcoming events (club meetings, guest lectures, career fairs) in the app. Your job is to:

1. Add event data and API functions to `lib/api.ts`
2. Build an Events list screen (accessible from the Home tab)
3. Build an Event detail screen
4. Add an "Upcoming Event" card to the Home screen

Everything must follow the fetch lifecycle: loading → success/error, with retry buttons on error and pull-to-refresh on the list.

---

## Expected File Changes

When you are done, your project should have these new and modified files:

```
MODIFIED:  lib/api.ts                              <-- Add event types + mock data + API functions
MODIFIED:  app/(tab)/home.tsx                      <-- Add "Upcoming Event" card that navigates to events
NEW:       app/(tab)/events/_layout.tsx             <-- Stack navigator for events
NEW:       app/(tab)/events/index.tsx               <-- Events list screen
NEW:       app/(tab)/events/[id].tsx                <-- Event detail screen
MODIFIED:  app/(tab)/_layout.tsx                    <-- (Optional) Add Events tab, OR navigate from Home
```

**Navigation approach:** Events are accessible by tapping the "Upcoming Event" card on the Home screen, which navigates to `/(tab)/events/`. You may optionally add an Events tab, but it is not required.

---

## Tasks

### Task 1: Add Event Types and Mock Data to the API (20 marks)

Extend `lib/api.ts` with event-related types, mock data, and API functions.

#### 1a. Define Types (5 marks)

Add these types to `lib/api.ts`:

```ts
type Event = {
  id: string;
  title: string;
  date: string;        // e.g., "Feb 25, 2026"
  time: string;        // e.g., "12:00 - 13:30"
  location: string;    // e.g., "Main Auditorium"
  category: string;    // e.g., "Career", "Club", "Academic"
};

type EventDetail = Event & {
  description: string;
  organizer: string;
  capacity: string;    // e.g., "120 / 200 spots filled"
  announcements: string[];
};
```

Export both types.

#### 1b. Create Mock Data (10 marks)

Add at least **3 events** to a `EVENTS` array and a `EVENT_DETAILS` record (same pattern as courses). Your events should have:

- Different categories (at least 2 different categories)
- Realistic campus event data
- At least 2 announcements per event detail
- A `capacity` field with a "filled / total" format

#### 1c. Add API Functions (5 marks)

Add two new exported functions:

```ts
export async function getEvents(): Promise<Event[]>
export async function getEventById(id: string): Promise<EventDetail>
```

Both should call `delay()` and `maybeThrow()` before returning data (same pattern as the course functions).

---

### Task 2: Build the Events List Screen (30 marks)

Create `app/(tab)/events/index.tsx` — a screen that fetches and displays all events.

#### 2a. Navigation Setup (5 marks)

- Create `app/(tab)/events/_layout.tsx` with a Stack navigator (two screens: `index` and `[id]`)
- Ensure the events screens are accessible from the app (either through navigation from Home or as a new tab)

#### 2b. Fetch and Display Events (15 marks)

- State: `events` array, `isLoading`, `refreshing`, `error`
- Fetch function: `loadEvents` using `try/catch/finally` pattern
- `useEffect` to load on mount
- Display events using `FlatList` with `AppCard` for each event
- Each card should show the event title and `${item.date} — ${item.location}` as subtitle
- Each card should be tappable — navigate to the event detail screen

#### 2c. Loading, Error, Empty, and Refresh States (10 marks)

- Full-screen `ActivityIndicator` for first load
- Error state with icon, message, and "Try Again" button
- `ListEmptyComponent` with message "No events found."
- Pull-to-refresh with separate `refreshing` state

---

### Task 3: Build the Event Detail Screen (25 marks)

Create `app/(tab)/events/[id].tsx` — a screen that fetches and displays one event's full details.

#### 3a. Fetch Event Data (10 marks)

- Extract `id` from route params using `useLocalSearchParams`
- State: `event`, `isLoading`, `error`
- Fetch function: `loadEvent` calling `api.getEventById(id)`
- `useEffect` to load on mount

#### 3b. Display Event Details (10 marks)

Using `ScrollView` and `AppCard` components, display:

- Event title and date as a header
- Info cards for: time, location, category, organizer, capacity
- Each info card should have an appropriate Ionicons icon on the right
- Announcements section (same pattern as course detail — map over the array)

#### 3c. Loading and Error States (5 marks)

- `ActivityIndicator` while loading
- Error state with "Try Again" button
- Same pattern as the course detail page

---

### Task 4: Add Upcoming Event to Home Screen (15 marks)

Modify `app/(tab)/home.tsx` to show an "Upcoming Event" card.

#### 4a. Fetch Event Data (5 marks)

You have two approaches (choose one):

- **Option A:** Add a `getUpcomingEvent()` function to `api.ts` that returns the first event, and call it alongside `getDashboard()`
- **Option B:** Add an `upcomingEvent` field to `DashboardData` and include it in the `getDashboard()` response

Either approach is acceptable.

#### 4b. Display the Card (5 marks)

- Add an `AppCard` below the existing Attendance card
- Show the event title and date
- Use an appropriate icon (e.g., `calendar-outline`)

#### 4c. Navigate to Event Detail (5 marks)

- Wrap the card in a `Pressable`
- On press, navigate to the event detail screen: `/(tab)/events/${event.id}`
- This is cross-tab navigation (from Home tab to Events) — it should work with `router.push`

---

### Task 5: Styling + Polish (10 marks)

#### Events List (5 marks)

- Category shown on each card (as part of the subtitle or as a separate text element)
- Cards use `AppCard` consistently with the rest of the app
- Pull-to-refresh spinner uses theme colors
- Theme values used throughout (`theme.colors`, `theme.spacing`, `theme.radius`)

#### Event Detail (5 marks)

- Info cards use appropriate icons for each field
- Description text is readable (proper line height and spacing)
- Announcements visually distinct from info cards
- Overall layout matches the course detail page style

---

## Submission Requirements

Submit the following files:

1. `lib/api.ts` — Updated with event types, mock data, and API functions
2. `app/(tab)/events/_layout.tsx` — Stack navigator
3. `app/(tab)/events/index.tsx` — Events list screen
4. `app/(tab)/events/[id].tsx` — Event detail screen
5. `app/(tab)/home.tsx` — Updated with upcoming event card

---

## Rubric

| Task | Criteria | Marks |
|------|----------|-------|
| **Task 1: API Types + Data** | | **20** |
| | `Event` and `EventDetail` types defined and exported | 5 |
| | At least 3 events with realistic data and 2+ categories | 10 |
| | `getEvents()` and `getEventById()` functions with delay + maybeThrow | 5 |
| **Task 2: Events List** | | **30** |
| | Stack navigator with index and [id] screens | 5 |
| | Events fetched on mount with correct state management | 5 |
| | FlatList renders events as tappable AppCards | 5 |
| | Card subtitle includes date and location | 5 |
| | Loading state with ActivityIndicator | 2 |
| | Error state with icon, message, and Try Again button | 3 |
| | ListEmptyComponent for empty state | 2 |
| | Pull-to-refresh with separate refreshing state | 3 |
| **Task 3: Event Detail** | | **25** |
| | Route param extracted with useLocalSearchParams | 3 |
| | Event fetched on mount with try/catch/finally | 7 |
| | Header displays title and date | 3 |
| | Info cards for time, location, category, organizer, capacity | 5 |
| | Announcements mapped to AppCards | 3 |
| | Loading and error states | 4 |
| **Task 4: Home Event Card** | | **15** |
| | Upcoming event data fetched (via new function or extended dashboard) | 5 |
| | AppCard displays event title and date | 5 |
| | Tapping navigates to event detail screen | 5 |
| **Task 5: Styling** | | **10** |
| | Events list styled consistently with courses list | 5 |
| | Event detail styled consistently with course detail | 5 |
| | | **Total: 100** |

---

## Hints

These should point you in the right direction without giving away the solution.

1. **Copy the course pattern:** The events list is structurally identical to the courses list. The event detail is structurally identical to the course detail. Copy those files and rename everything from "course" to "event" — it's the fastest way to get started.

2. **Stack navigator:** The `events/_layout.tsx` is identical to `courses/_layout.tsx` in structure:
   ```tsx
   import { Stack } from "expo-router";
   export default function EventsLayout() {
     return (
       <Stack>
         <Stack.Screen name="index" options={{ title: "Events" }} />
         <Stack.Screen name="[id]" options={{ title: "Event Details" }} />
       </Stack>
     );
   }
   ```

3. **Cross-tab navigation from Home:** To navigate from the Home tab to an events detail screen, use the full path: `router.push("/(tab)/events/event1")`. Expo Router handles the tab switch automatically.

4. **Event categories:** Good categories for campus events: "Career" (job fairs, resume workshops), "Club" (club meetings, social events), "Academic" (guest lectures, study sessions), "Sports" (intramurals, tournaments).

5. **The `Record<string, EventDetail>` pattern:** Same as course details — use the event ID as the key:
   ```ts
   const EVENT_DETAILS: Record<string, EventDetail> = {
     "event1": { ...EVENTS[0], description: "...", organizer: "..." },
     // ...
   };
   ```

6. **Icons for event detail cards:** Some suggestions:
   - Time: `time-outline`
   - Location: `location-outline`
   - Category: `pricetag-outline`
   - Organizer: `people-outline`
   - Capacity: `ticket-outline`

7. **Upcoming event on Home:** The simplest approach is to add a function to `api.ts`:
   ```ts
   export async function getUpcomingEvent(): Promise<Event> {
     await delay();
     maybeThrow();
     return EVENTS[0]; // Return the first event as "upcoming"
   }
   ```
   Then in `home.tsx`, call it alongside `getDashboard()` and store the result in a separate state variable.

8. **Calling two API functions in one screen:** If the Home screen needs both dashboard data and an upcoming event, you can call both in the same fetch function:
   ```tsx
   async function loadHome() {
     try {
       setError(null);
       setIsLoading(true);
       const dashboardResult = await api.getDashboard();
       const eventResult = await api.getUpcomingEvent();
       setData(dashboardResult);
       setUpcomingEvent(eventResult);
     } catch (e) {
       setError(e instanceof Error ? e.message : "Something went wrong");
     } finally {
       setIsLoading(false);
     }
   }
   ```

9. **Don't forget `maybeThrow()` in new functions:** Your new API functions should call `delay()` and `maybeThrow()` just like the existing ones. This ensures error states work for events too when `SHOULD_FAIL` is toggled.

10. **Testing:** After building everything, toggle `SHOULD_FAIL = true` and verify that the events list, event detail, and Home screen all show error states. Toggle it back and verify "Try Again" works on every screen. Test pull-to-refresh on the events list. These are the same verification steps from the student challenge.

---

*This lab builds on the API patterns from the Week 10 guide. Every screen you build follows the same pattern: state setup, extracted fetch function, useEffect on mount, conditional rendering (loading/error/empty/data). If you get stuck, compare your events code to the courses code — they should look nearly identical in structure.*
