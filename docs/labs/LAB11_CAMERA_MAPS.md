# Lab 11: Camera + Maps

## Objective

Extend the campus events feature you built in Lab 10 with two new capabilities: event organizers can attach a cover photo to an event, and events have a physical location that shows on a map. Apply the same `expo-image-picker` and `react-native-maps` patterns from the Week 11 guide, but with event-related data you already built.

---

## What You Already Have

After completing the Week 11 guide, your app has:

- **Profile photo picker** (`profile.tsx`) — camera + library, permission handling, circular avatar, persistence
- **Campus map** (`map.tsx`) — MapView with building markers, user location, building list
- **4-tab layout** — Home, Courses, Map, Settings
- **Permission patterns** — `requestCameraPermissionsAsync`, `requestMediaLibraryPermissionsAsync`, `requestForegroundPermissionsAsync`
- **Events feature** (from Lab 10) — events list, event detail, upcoming event on Home

You will be **extending the events feature** and **building a new event map screen**.

---

## Scenario

The student association wants two new features for the events section:

1. **Event cover photos** — organizers add a photo when creating an event. In your app, let students "upload" (pick) a cover photo for each event from their device.
2. **Event map** — events happen at physical locations on campus. Show a dedicated map screen from the event detail page, with a marker at the event's location.

---

## Expected File Changes

```
MODIFIED:  lib/api.ts                            <-- Add coordinate field to EventDetail
MODIFIED:  app/(tab)/events/[id].tsx             <-- Add "Cover Photo" picker + "View on Map" button
NEW:       app/(tab)/events/[id]/map.tsx         <-- Event location map screen
MODIFIED:  app/(tab)/events/_layout.tsx          <-- Add map screen to the Stack
```

> **Note on file structure:** `app/(tab)/events/[id]/map.tsx` creates a route at `/(tab)/events/EVENT_ID/map`. This is a nested route inside the dynamic `[id]` segment. This is valid Expo Router syntax.

---

## Tasks

### Task 1: Add Coordinates to Event Data (15 marks)

Events happen at physical locations. Add coordinate data to the event API.

#### 1a. Update the `EventDetail` type (5 marks)

Add a `coordinate` field to `EventDetail` in `lib/api.ts`:

```ts
type EventDetail = Event & {
  description: string;
  organizer: string;
  capacity: string;
  announcements: string[];
  coordinate: {       // ← ADD THIS
    latitude: number;
    longitude: number;
  };
};
```

#### 1b. Add coordinates to each event detail (10 marks)

Update each entry in `EVENT_DETAILS` to include a `coordinate`. Use realistic campus building locations — pick from the coordinates already defined in `app/(tab)/map.tsx`, or use your own.

For example:
```ts
EVENT_DETAILS: {
  "event1": {
    ...EVENTS[0],
    description: "...",
    organizer: "...",
    capacity: "...",
    announcements: [...],
    coordinate: { latitude: 51.0648, longitude: -114.0862 },  // Library
  },
  // ...
}
```

Each of your 3+ events must have a different coordinate (different buildings).

---

### Task 2: Add a Cover Photo to Event Detail (30 marks)

Modify `app/(tab)/events/[id].tsx` to allow students to add a cover photo to any event.

#### 2a. State and storage (10 marks)

- Add a `photoUri` state variable (`string | null`)
- On mount, load any saved photo for this event from AsyncStorage
- Use a **unique storage key per event** — e.g., `"event_photo_" + id` — so each event has its own photo

**Hint:** You can build the key dynamically:
```ts
const photoKey = `event_photo_${id}`;
const savedPhoto = await storage.get<string>(photoKey);
```

You do not need to add this key to `STORAGE_KEYS` — dynamic keys are fine for per-item data.

#### 2b. Photo picker function (10 marks)

Add a `handlePhotoPress` function and an `openPicker` function with the same structure as in `profile.tsx`:

- Show `Alert.alert` with "Take Photo", "Choose from Library", and "Cancel"
- Request the appropriate permission before launching the picker
- If permission denied, show an informative `Alert.alert`
- On selection, update `photoUri` state and save to storage with `photoKey`
- Check `result.canceled` before reading `result.assets[0]`

#### 2c. Cover photo display (10 marks)

At the top of the event detail screen (above the event title), render:

- **If `photoUri` is set:** Display the photo as a full-width banner image (not a circular avatar — use a rectangular banner style)
- **If `photoUri` is null:** Display a placeholder `View` with a camera icon and "Tap to add cover photo" text
- Both states should be tappable (`Pressable`) and call `handlePhotoPress`

**Suggested styles for the banner image:**
```ts
coverImage: {
  width: "100%",
  height: 200,
},
coverPlaceholder: {
  width: "100%",
  height: 200,
  backgroundColor: theme.colors.card,
  borderWidth: 1,
  borderColor: theme.colors.border,
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
},
```

---

### Task 3: Build the Event Location Map Screen (35 marks)

Create a dedicated map screen for each event that shows a single marker at the event's location.

#### 3a. Navigation setup (5 marks)

Update `app/(tab)/events/_layout.tsx` to add a `[id]/map` screen:

```tsx
<Stack.Screen name="[id]/map" options={{ title: "Event Location" }} />
```

This adds a new screen to the events Stack navigator reachable via `/(tab)/events/EVENT_ID/map`.

#### 3b. Add a "View on Map" button to the event detail (5 marks)

In `app/(tab)/events/[id].tsx`, add an `AppCard` (or a styled `Pressable`) below the location info card that navigates to the event map:

```tsx
<Pressable onPress={() => router.push(`/(tab)/events/${id}/map`)}>
  <AppCard
    title="View on Map"
    subtitle="See where this event takes place"
    right={<Ionicons name="map-outline" size={20} color={theme.colors.primary} />}
  />
</Pressable>
```

#### 3c. Create `app/(tab)/events/[id]/map.tsx` (25 marks)

Build the event location map screen.

**Route parameter (5 marks):**
- Extract the `id` param from the route using `useLocalSearchParams<{ id: string }>()`
- Call `api.getEventById(id)` to get the event (including its coordinate)
- Handle loading, error states with `try/catch/finally`

**MapView with single marker (10 marks):**
- Show a `MapView` centered on the event's coordinate
- Use `latitudeDelta: 0.003` and `longitudeDelta: 0.003` for a tight street-level zoom
- Place a `<Marker>` at the event's coordinate with the event title and location as title/description
- Enable `showsUserLocation` (request location permission with the same pattern as `map.tsx`)

**Event summary below the map (10 marks):**
- Below the map, show the event title, date, time, and location using `AppCard` components
- Add a "Get Directions" `AppCard` at the bottom (the button doesn't need to actually open a maps app — just render it for now)

---

### Task 4: Styling + Polish (10 marks)

#### Cover photo (5 marks)

- The cover photo / placeholder must span the full width of the screen
- The placeholder shows a camera icon (`camera-outline`) and helpful text
- Tapping anywhere on the placeholder or the photo triggers the picker
- The photo has no circular border radius (it's a banner, not an avatar)

#### Event map screen (5 marks)

- Map takes up at least 50% of the screen height
- Event summary cards are scrollable if content overflows
- Theme values used throughout (`theme.colors`, `theme.spacing`, `theme.radius`)
- Consistent visual style with the rest of the app

---

## Submission Requirements

Submit the following files:

1. `lib/api.ts` — Updated with `coordinate` field in `EventDetail` and data
2. `app/(tab)/events/[id].tsx` — Updated with cover photo picker + "View on Map" button
3. `app/(tab)/events/_layout.tsx` — Updated with `[id]/map` screen
4. `app/(tab)/events/[id]/map.tsx` — New event location map screen

---

## Rubric

| Task | Criteria | Marks |
|------|----------|-------|
| **Task 1: Coordinate Data** | | **15** |
| | `coordinate` field added to `EventDetail` type | 5 |
| | All 3+ events have unique, realistic coordinates | 10 |
| **Task 2: Cover Photo** | | **30** |
| | `photoUri` state loaded from storage on mount | 5 |
| | Storage key is per-event (`event_photo_${id}`) | 5 |
| | `handlePhotoPress` shows Camera/Library/Cancel alert | 3 |
| | `openPicker` requests permission before launching picker | 5 |
| | `result.canceled` checked before reading `assets[0]` | 4 |
| | Selected photo saved to storage with dynamic key | 4 |
| | Full-width banner image shown when `photoUri` is set | 4 |
| **Task 3: Event Map Screen** | | **35** |
| | `_layout.tsx` includes `[id]/map` screen | 5 |
| | "View on Map" button navigates to `/(tab)/events/EVENT_ID/map` | 5 |
| | Event fetched with `try/catch/finally`, loading + error states | 8 |
| | `MapView` centered on event coordinate, correct zoom level | 7 |
| | `<Marker>` at event location with title and description | 5 |
| | Event summary cards (title, date, time, location) below map | 5 |
| **Task 4: Styling** | | **10** |
| | Cover photo / placeholder spans full width, consistent style | 5 |
| | Event map screen layout consistent with campus map style | 5 |
| | | **Total: 90** |

---

## Hints

1. **Dynamic storage keys:** You don't need a constant in `STORAGE_KEYS` for per-item data. Build the key from the ID: `"event_photo_" + id`. This is the same pattern databases use for row keys.

2. **Reuse the `openPicker` pattern exactly:** The function in your `profile.tsx` is exactly what you need in `events/[id].tsx`. You can copy it almost unchanged — just update the storage key from `STORAGE_KEYS.PROFILE_PHOTO` to `"event_photo_" + id`.

3. **Nested route syntax in Expo Router:** The file `app/(tab)/events/[id]/map.tsx` creates the route `/(tab)/events/EVENT_ID/map`. The `[id]` in the file path is treated as a dynamic segment — it works the same way as `[id].tsx` for the event detail. You need to add `<Stack.Screen name="[id]/map" ... />` to `_layout.tsx` to give it a proper header.

4. **Getting the ID in the nested map screen:** Inside `events/[id]/map.tsx`, `useLocalSearchParams()` still gives you `{ id }` from the URL — Expo Router propagates parent segment params to children automatically.

5. **Street-level zoom for a single event:** Use `latitudeDelta: 0.003` and `longitudeDelta: 0.003`. This zooms in enough to see a single building clearly. The campus map used `0.008` to see all buildings — narrower zoom for a single point.

6. **Cover photo is a banner, not a circle:** Unlike the profile photo, don't apply `borderRadius`. Use:
   ```ts
   coverImage: { width: "100%", height: 200 }
   ```
   No `borderRadius: 100` needed.

7. **Showing the placeholder:** The placeholder should look tappable — a camera icon is the universal signal for "tap to add a photo":
   ```tsx
   <Pressable onPress={handlePhotoPress} style={styles.coverPlaceholder}>
     <Ionicons name="camera-outline" size={36} color={theme.colors.muted} />
     <Text style={{ color: theme.colors.muted }}>Tap to add cover photo</Text>
   </Pressable>
   ```

8. **Permission flow is identical:** The same `requestCameraPermissionsAsync()` / `requestMediaLibraryPermissionsAsync()` pattern from the profile applies here. Copy the logic, just change what you do with the URI after picking.

9. **The "Get Directions" button:** For now, just render it as an `AppCard` with a map icon. In a real app, you'd use `Linking.openURL()` with a Maps deep link like `maps://0,0?q=lat,long`. This is a hint toward what comes after this course — deep links and OS integration.

10. **Test with `SHOULD_FAIL`:** Toggle `SHOULD_FAIL = true` in `api.ts` and open the event map screen. You should see the error state (same as event detail). Toggle back and verify recovery. This ensures your `try/catch/finally` is correctly set up.

---

*This lab combines the image picker pattern (Week 11, Day 1) and the maps pattern (Week 11, Day 2) and applies both to the events feature from Lab 10. The storage key pattern for per-item photos is a common pattern in production apps — each item has its own namespace in local storage. The nested route (`[id]/map`) shows how Expo Router handles deep navigation structures.*
