# Week 11: Camera + Maps

## Accessing Device Hardware — Image Picker and Interactive Maps

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

### Before (Week 10)

```
Settings tab
├── Settings screen
│   ├── Notifications toggle (persisted)
│   └── Account → Profile screen
│       ├── Grey circle placeholder (no photo)
│       ├── Name, email, student ID, phone
│       └── Edit Profile button

Home tab     ← unchanged
Courses tab  ← unchanged

(No map anywhere in the app)
```

The profile screen shows form data only. There is no way to add a photo. The app has no map — if a student wanted to find a building on campus, the app has nothing to offer.

### After (Week 11)

```
Settings tab
├── Settings screen (unchanged)
└── Account → Profile screen
    ├── Circular photo avatar at top
    │   ├── Shows grey person icon (no photo) OR actual photo
    │   └── Tap → "Take Photo" or "Choose from Library"
    │       ├── Permission prompt → camera opens OR gallery opens
    │       └── Crop to square → photo appears immediately + saved
    ├── Name, email, student ID, phone (unchanged)
    └── Edit Profile button (unchanged)

Map tab  ← NEW (4th tab)
├── "Campus Map" title
├── Interactive map (zoom, pan, satellite view)
│   ├── 6 building markers (tap to see name + description)
│   └── Blue dot: user's current location (if permission granted)
└── Building list (scrollable, tap to highlight on map)
    ├── Main Building
    ├── Library & Learning Commons
    ├── Sciences Building
    ├── Recreation Centre
    ├── Student Hub & Cafeteria
    └── North Parking Lot
```

The profile screen now has a profile photo that persists across app restarts. The app has a 4th tab with a fully interactive campus map — students can find buildings, zoom in, and see their own location.

---

## Architecture Impact <a name="architecture-impact"></a>

### New Packages

```
Before:                              After (Week 11):
──────                               ────────────────
(no camera/maps packages)            expo-image-picker   ← photo from camera or library
                                     expo-location       ← user's GPS coordinates
                                     react-native-maps   ← interactive map component
```

**Installation (run once, before starting):**

```bash
npx expo install expo-image-picker expo-location react-native-maps
```

`npx expo install` (not `npm install`) automatically selects the versions compatible with your Expo SDK. Always use it for Expo packages.

### Modified Files

```
lib/
└── storage.ts          ← MODIFIED: added PROFILE_PHOTO storage key

app/(tab)/
├── _layout.tsx         ← MODIFIED: added 4th Map tab
└── settings/
    └── profile.tsx     ← MODIFIED: added avatar + image picker logic
```

### New Files

```
app/(tab)/
└── map.tsx             ← NEW: campus map screen
```

### Updated Architecture Diagram

```
    app/_layout.tsx .................. Stack (Root)
        |
        └── app/(tab)/_layout.tsx ... Tabs (NOW 4 TABS)
                |
                ├── home.tsx ........ unchanged (Week 10)
                |
                ├── courses/_layout.tsx
                |       ├── index.tsx
                |       └── [id].tsx
                |
                ├── map.tsx ......... NEW — campus map + building list
                |
                └── settings/_layout.tsx
                        ├── index.tsx ... unchanged
                        └── profile.tsx . MODIFIED — photo avatar + picker

    lib/
    ├── storage.ts .... MODIFIED (added PROFILE_PHOTO key)
    └── api.ts ........ unchanged (Week 10)

    app.json .......... MODIFIED — permission descriptions for iOS/Android
```

### Updated `app.json` — Permission Descriptions

Both iOS and Android require you to explain WHY your app needs each permission. iOS shows this text in the system permission alert. Android declares which permissions the app uses.

```json
"plugins": [
  ["expo-image-picker", {
    "photosPermission": "Campus Hub accesses your photo library so you can choose a profile photo.",
    "cameraPermission": "Campus Hub uses your camera so you can take a profile photo.",
    "microphonePermission": false
  }],
  ["expo-location", {
    "locationWhenInUsePermission": "Campus Hub uses your location to show where you are on the campus map."
  }]
]
```

**Why these strings matter:** Apple requires permission strings to be descriptive and honest about the actual use. Generic strings like "We need camera access" are rejected during App Store review. Specific strings ("to take a profile photo") are approved.

---

## New Concepts <a name="new-concepts"></a>

### 1. The Device Permissions Model

Before Week 11, the app only needed internet access (Week 10) and storage (Week 9) — both of which are automatically available. Camera, photos, and location require the **user's explicit consent**.

```
┌─────────────────────────────────────────────────────────────┐
│               PERMISSION LIFECYCLE                           │
│                                                             │
│   App requests permission                                   │
│         │                                                   │
│         ▼                                                   │
│   System shows alert:                                       │
│   "Campus Hub wants to access your photos"                  │
│   [Allow]  [Don't Allow]                                    │
│         │                                                   │
│    ─────┴───────────                                        │
│    │           │                                            │
│    ▼           ▼                                            │
│  "granted"   "denied"                                       │
│  Use the     Show a message                                 │
│  feature     explaining why                                 │
│                and where to                                 │
│                enable it in                                 │
│                Settings                                     │
└─────────────────────────────────────────────────────────────┘
```

**Key rule: ask right before you use.** Don't request all permissions on app startup — that feels invasive. Request camera permission when the user taps "Take Photo." Request location when the user opens the Map tab. This is called **contextual permission requests**.

**Permissions are sticky.** Once a user grants or denies a permission, the system remembers it. Calling `requestCameraPermissionsAsync()` again when permission is already granted returns `"granted"` instantly without showing an alert. Calling it when denied also returns `"denied"` instantly — the user must go to their device Settings to change it.

### 2. `expo-image-picker` — Two Launch Modes

`expo-image-picker` provides two functions:

```ts
// Opens the device camera to take a new photo
ImagePicker.launchCameraAsync(options)

// Opens the photo library to pick an existing photo
ImagePicker.launchImageLibraryAsync(options)
```

Both return a **Promise** that resolves with a `result` object:

```ts
type ImagePickerResult = {
  canceled: boolean;           // true if user pressed Cancel
  assets: [{
    uri: string;               // file path on the device (e.g., "file:///...")
    width: number;
    height: number;
    // ... more fields
  }] | null;
};
```

**The pattern:**

```ts
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: "images",   // images only (no video)
  allowsEditing: true,    // shows a crop UI
  aspect: [1, 1],         // crop ratio (square for profile photos)
  quality: 0.8,           // compression (0 = lowest, 1 = original)
});

if (!result.canceled) {
  const uri = result.assets[0].uri;
  // uri is a string like "file:///var/mobile/..."
  // Use it in an <Image source={{ uri }} /> component
}
```

**Why `result.canceled`?** The user always has the option to dismiss the picker without choosing a photo. You must check `canceled` before trying to read `result.assets[0]` — if they cancelled, `assets` is null.

### 3. Saving Images — URIs vs Base64

When the picker returns an image, it returns a **URI** (a file path on the device). This is a short string like `"file:///var/mobile/Containers/Data/.../photo.jpg"`.

**What to store in AsyncStorage:** The URI string, not the actual image data.

```
❌ WRONG approach: Encode image as base64 and store the whole thing
   → A single photo can be 1–5 MB of text. AsyncStorage has limits and
     will slow down significantly with that much data.

✅ CORRECT approach: Store just the URI (a short file path string)
   → The image stays in the device's file system (where it belongs).
     We just remember where it is.
```

**In code:**

```ts
// Save — just the URI string
await storage.set(STORAGE_KEYS.PROFILE_PHOTO, result.assets[0].uri);

// Load — get the URI string back, pass it to Image
const savedUri = await storage.get<string>(STORAGE_KEYS.PROFILE_PHOTO);
if (savedUri) {
  return <Image source={{ uri: savedUri }} style={styles.avatar} />;
}
```

**Caveat:** On iOS, URIs created by the camera (`launchCameraAsync`) are saved permanently in the user's photo roll. URIs from `launchImageLibraryAsync` point to the original file in the library. Both survive app restarts.

### 4. `Alert.alert()` — An Action Sheet Pattern

Rather than building a full custom UI for "Camera or Gallery?", we use `Alert.alert()` with multiple buttons. On iOS this appears as an action sheet from the bottom; on Android it shows as a dialog.

```ts
Alert.alert(
  "Profile Photo",      // title
  "Choose a source",    // message (optional)
  [
    { text: "Take Photo",          onPress: () => openPicker("camera") },
    { text: "Choose from Library", onPress: () => openPicker("library") },
    { text: "Cancel",              style: "cancel" },
  ]
);
```

**Why `style: "cancel"`?** This styles the cancel button differently (bold on iOS, separate from the others). It also ensures that on iOS, the cancel option is placed at the bottom and is always dismissible with a tap outside the sheet.

### 5. `react-native-maps` — MapView and Markers

`react-native-maps` provides a `MapView` component that renders a native map (Apple Maps on iOS, Google Maps on Android).

```tsx
import MapView, { Marker } from "react-native-maps";

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 51.0642,
    longitude: -114.0878,
    latitudeDelta: 0.008,  // how much vertical area to show (in degrees)
    longitudeDelta: 0.008, // how much horizontal area to show (in degrees)
  }}
  showsUserLocation={true}   // show the blue dot
  showsMyLocationButton={true} // show the "re-center on me" button
>
  <Marker
    coordinate={{ latitude: 51.0642, longitude: -114.0878 }}
    title="Main Building"
    description="Administration, classrooms T100–T400"
  />
</MapView>
```

**Understanding `latitudeDelta` and `longitudeDelta`:**

```
latitudeDelta = 0.008 means the map shows about 0.008° of latitude.
1° of latitude ≈ 111 km, so 0.008° ≈ 890 metres.

This gives a tight campus-level zoom where you can see all buildings.
Compare:
  0.001 → one city block          (very zoomed in)
  0.008 → a small campus          ← we use this
  0.05  → a neighbourhood
  0.5   → a city
  5.0   → a province/state        (very zoomed out)
```

**`<Marker>` as children of `<MapView>`:** Markers are React components rendered as children of `MapView`. They automatically position themselves on the map at their `coordinate`. Adding or removing markers is just adding or removing JSX children — no imperative map API required.

### 6. `expo-location` — User's GPS Coordinates

`expo-location` provides access to the device's GPS. For the campus map, we only need the user's current location (not continuous tracking), so we request "when in use" permission (the device's GPS is only active while the app is open).

```ts
import * as Location from "expo-location";

// Request permission
const { status } = await Location.requestForegroundPermissionsAsync();

if (status === "granted") {
  // We can now show the user's location on the map
  // react-native-maps handles the blue dot automatically
  // when showsUserLocation={true} is set
}
```

**Why we don't call `Location.getCurrentPositionAsync()`?** For the campus map, we just need to show the user's location as a blue dot — `react-native-maps` handles that internally when `showsUserLocation={true}`. We only need the permission status to decide whether to enable that prop.

**Foreground vs background location:**

```
requestForegroundPermissionsAsync()   ← location while app is open
requestBackgroundPermissionsAsync()   ← location even when app is closed

We always start with foreground. Background is much harder to get
approved on the App Store and requires a strong justification.
```

### 7. Native Modules — Why These Packages Need a Dev Build

`expo-image-picker`, `expo-location`, and `react-native-maps` are **native modules** — they contain platform-specific code (Swift/Objective-C for iOS, Kotlin/Java for Android) that React Native calls from JavaScript.

This is different from the packages we've used so far:

```
Pure JavaScript packages      Native module packages
(work in Expo Go):            (require development build):
──────────────────────        ──────────────────────────
@react-native-async-storage   react-native-maps
expo-router                   (some native modules)
react
react-native (core)

Expo managed native modules   (work in Expo Go):
──────────────────────────
expo-image-picker             ← works in Expo Go
expo-location                 ← works in Expo Go
```

`expo-image-picker` and `expo-location` are **Expo SDK packages** — they're pre-bundled into Expo Go. `react-native-maps` requires a **development build** (`npx expo run:ios` or `npx expo run:android`) because it bundles native map rendering code that isn't in Expo Go.

> **For this course:** The instructor will run the app on a development build. Expo Go will work for the camera and location portions; the map will only render on a dev build.

---

## Step-by-Step Implementation <a name="step-by-step"></a>

### Step 1: Install the New Packages

Run this command in your project directory:

```bash
npx expo install expo-image-picker expo-location react-native-maps
```

After installation, your `package.json` will include these three packages with the correct versions for your Expo SDK.

---

### Step 2: Update `app.json` — Add Permission Descriptions

Permission descriptions are required by both Apple and Google. Without them, the system permission alert shows a blank explanation (iOS) or the build fails (Android). Add them to the `plugins` array in `app.json`:

```json
"plugins": [
  "expo-router",
  ["expo-splash-screen", { ... }],

  ["expo-image-picker", {
    "photosPermission": "Campus Hub accesses your photo library so you can choose a profile photo.",
    "cameraPermission": "Campus Hub uses your camera so you can take a profile photo.",
    "microphonePermission": false
  }],

  ["expo-location", {
    "locationWhenInUsePermission": "Campus Hub uses your location to show where you are on the campus map."
  }]
]
```

Also add to the `ios` section:

```json
"ios": {
  "supportsTablet": true,
  "infoPlist": {
    "NSCameraUsageDescription": "Campus Hub uses your camera so you can take a profile photo.",
    "NSPhotoLibraryUsageDescription": "Campus Hub accesses your photo library so you can choose a profile photo.",
    "NSLocationWhenInUseUsageDescription": "Campus Hub uses your location to show where you are on the campus map."
  }
}
```

And add to the `android` section:

```json
"android": {
  "permissions": [
    "android.permission.CAMERA",
    "android.permission.READ_MEDIA_IMAGES",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION"
  ]
}
```

---

### Step 3: Update `lib/storage.ts` — Add the Photo Key

Add one new key to the `STORAGE_KEYS` object. This is the same storage utility from Week 9 — we're just adding a new named key.

**File:** `lib/storage.ts`

```ts
export const STORAGE_KEYS = {
  PROFILE: "profile",
  NOTIFICATIONS: "notifications",
  PROFILE_PHOTO: "profile_photo", // ← Week 11: stores the URI of the profile photo
} as const;
```

**Why a constant key?** Same reason as before — `STORAGE_KEYS.PROFILE_PHOTO` is checked by TypeScript. The string `"profile_photo"` typed manually could have a typo; the constant cannot.

---

### Step 4: Update the Profile Screen — Add Image Picker

**File:** `app/(tab)/settings/profile.tsx`

This is the largest change this week. We're adding a photo avatar and the picker logic on top of the existing Week 9 form. The form itself is **unchanged** — we're only adding new things.

#### 4a. New imports

```tsx
import {
  // ← existing imports stay the same, add these:
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
```

**`Alert`** — provides `Alert.alert()` for the "Camera or Library?" prompt.
**`Image`** — displays the photo. We use React Native's built-in `Image` (not `expo-image`) since we're just showing a local file URI.
**`* as ImagePicker`** — same import pattern as `* as api` and `* as storage`. All exported functions are accessed as `ImagePicker.launchCameraAsync()`, etc.

#### 4b. New state variable

```tsx
const [photoUri, setPhotoUri] = useState<string | null>(null);
```

`photoUri` holds the file path to the current profile photo. It's `null` when no photo has been set.

#### 4c. Load photo on mount

Inside the existing `loadProfile` function (inside `useEffect`), add after loading profile data:

```tsx
// Load saved photo URI
const savedPhoto = await storage.get<string>(STORAGE_KEYS.PROFILE_PHOTO);
if (savedPhoto !== null) {
  setPhotoUri(savedPhoto);
}
```

This mirrors the Week 9 pattern exactly — `storage.get` returns `null` if nothing was saved, so we only update state when there's actually a saved URI.

#### 4d. The photo picker functions

Add these two new functions inside the component, before the form helpers:

```tsx
const handlePhotoPress = () => {
  Alert.alert("Profile Photo", "Choose a source", [
    { text: "Take Photo",          onPress: () => openPicker("camera") },
    { text: "Choose from Library", onPress: () => openPicker("library") },
    { text: "Cancel",              style: "cancel" },
  ]);
};

const openPicker = async (source: "camera" | "library") => {
  // Step 1: Request permission
  if (source === "camera") {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Camera access is required to take a profile photo. Enable it in Settings."
      );
      return;
    }
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Photo library access is required. Enable it in Settings."
      );
      return;
    }
  }

  // Step 2: Launch the appropriate picker
  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

  // Step 3: Save the URI if the user didn't cancel
  if (!result.canceled) {
    const uri = result.assets[0].uri;
    setPhotoUri(uri);
    await storage.set(STORAGE_KEYS.PROFILE_PHOTO, uri);
  }
};
```

**Walking through `openPicker`:**

1. Check which source was requested (`"camera"` or `"library"`)
2. Request the appropriate permission (`requestCameraPermissionsAsync` vs `requestMediaLibraryPermissionsAsync`)
3. If denied, show an alert and `return` early — do not proceed
4. Launch the picker with the crop options (`aspect: [1, 1]` for a square crop)
5. If the user picked a photo (`!result.canceled`), save the URI to state and storage

#### 4e. The avatar JSX

Extract the avatar into a helper called `renderAvatar` so it can be reused in both view mode and edit mode:

```tsx
const renderAvatar = () => (
  <View style={styles.avatarSection}>
    <Pressable onPress={handlePhotoPress} style={styles.avatarContainer}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person-outline" size={44} color={theme.colors.muted} />
        </View>
      )}
      {/* Camera badge in the bottom-right corner of the avatar */}
      <View style={styles.cameraBadge}>
        <Ionicons name="camera" size={14} color="#ffffff" />
      </View>
    </Pressable>
    <Text style={styles.photoHint}>
      {photoUri ? "Tap to change photo" : "Tap to add photo"}
    </Text>
  </View>
);
```

**Why `renderAvatar` instead of a separate component?** `renderAvatar` is a function that closes over `photoUri` and `handlePhotoPress` from the parent scope. It's only used inside this one component — a full separate component would require passing those values as props. For a small, contained helper like this, a function inside the component is fine.

**The conditional render:**
- `photoUri` is truthy → render `<Image source={{ uri: photoUri }} />`
- `photoUri` is null → render the grey circle with a person icon

#### 4f. Add the avatar to both view and edit mode

Call `{renderAvatar()}` right after the `<Text style={styles.h1}>` in **both** the view mode and the edit mode returns:

```tsx
// In view mode:
return (
  <ScrollView ...>
    <Text style={styles.h1}>My Profile</Text>
    {renderAvatar()}    {/* ← ADD THIS */}
    <View style={styles.profileCard}>
      {/* ... existing profile rows ... */}
    </View>
    {/* ... existing button ... */}
  </ScrollView>
);

// In edit mode:
return (
  <ScrollView ...>
    <Text style={styles.h1}>Edit Profile</Text>
    {renderAvatar()}    {/* ← ADD THIS */}
    {/* ... existing form fields ... */}
  </ScrollView>
);
```

The photo is always visible and always tappable, regardless of whether the form is in view or edit mode.

#### 4g. New styles for the avatar

```tsx
avatarSection: {
  alignItems: "center",
  marginBottom: 24,
},
avatarContainer: {
  position: "relative",
},
avatar: {
  width: 100,
  height: 100,
  borderRadius: 50,    // half of width/height = circle
  borderWidth: 3,
  borderColor: theme.colors.border,
},
avatarPlaceholder: {
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: theme.colors.card,
  borderWidth: 2,
  borderColor: theme.colors.border,
  justifyContent: "center",
  alignItems: "center",
},
cameraBadge: {
  position: "absolute",
  bottom: 2,
  right: 2,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: theme.colors.primary,
  justifyContent: "center",
  alignItems: "center",
  borderWidth: 2,
  borderColor: theme.colors.bg,  // creates a gap between badge and avatar
},
photoHint: {
  marginTop: 8,
  fontSize: 13,
  color: theme.colors.muted,
},
```

**`borderRadius: 50` on a 100×100 View** — `borderRadius` at exactly half the width/height creates a perfect circle. This is the standard React Native pattern for circular images.

**`position: "absolute"` on the camera badge** — The badge overlaps the avatar in the bottom-right corner. Setting the parent container to `position: "relative"` and the badge to `position: "absolute"` with `bottom: 2, right: 2` pins it to that corner, regardless of the avatar's size.

---

### Step 5: Create the Campus Map Screen

**File:** `app/(tab)/map.tsx` (new file)

#### 5a. Building data

Define building data as a typed constant above the component:

```tsx
type Building = {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

const CAMPUS_BUILDINGS: Building[] = [
  {
    id: "main",
    title: "Main Building",
    description: "Administration, Registrar, classrooms T100–T400",
    coordinate: { latitude: 51.0642, longitude: -114.0878 },
  },
  {
    id: "library",
    title: "Library & Learning Commons",
    description: "Study spaces, computer labs, printing services",
    coordinate: { latitude: 51.0648, longitude: -114.0862 },
  },
  {
    id: "sciences",
    title: "Sciences Building",
    description: "Classrooms S100–S300, biology and chemistry labs",
    coordinate: { latitude: 51.0635, longitude: -114.0895 },
  },
  {
    id: "recreation",
    title: "Recreation Centre",
    description: "Fitness centre, pool, gym courts, student locker rooms",
    coordinate: { latitude: 51.0658, longitude: -114.0885 },
  },
  {
    id: "cafeteria",
    title: "Student Hub & Cafeteria",
    description: "Food court, student services, student association lounge",
    coordinate: { latitude: 51.0630, longitude: -114.0870 },
  },
  {
    id: "parking",
    title: "North Parking Lot",
    description: "Student parking — Lot N1 and N2",
    coordinate: { latitude: 51.0665, longitude: -114.0875 },
  },
];

const CAMPUS_CENTER = {
  latitude: 51.0648,
  longitude: -114.0878,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};
```

**Why define data outside the component?** This is the same reason `COURSES` was outside the component in early weeks — the data never changes, so there's no reason to re-create it on every render. It's not state; it's a constant.

#### 5b. State and permission request

```tsx
const CampusMap = () => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationGranted(true);
    } else {
      setLocationError(
        "Location access denied. You can still browse the campus map."
      );
    }

    setIsLoadingLocation(false);
  };
```

**State variables:**

| Variable | Type | Purpose |
|----------|------|---------|
| `locationGranted` | `boolean` | Whether to show the user's blue dot on the map |
| `locationError` | `string \| null` | Soft error message when location is denied |
| `selectedBuilding` | `Building \| null` | The building whose detail card is shown below the map |
| `isLoadingLocation` | `boolean` | Spinner while the permission check runs |

**Why `locationError` is "soft"?** Unlike the API screens where an error means the screen can't show its content, a denied location permission just means the user doesn't see the blue dot. The map still renders. We show a gentle banner instead of a full-screen error.

#### 5c. The MapView render

```tsx
<MapView
  style={styles.map}
  initialRegion={CAMPUS_CENTER}
  showsUserLocation={locationGranted}
  showsMyLocationButton={locationGranted}
>
  {CAMPUS_BUILDINGS.map((building) => (
    <Marker
      key={building.id}
      coordinate={building.coordinate}
      title={building.title}
      description={building.description}
      onPress={() => setSelectedBuilding(building)}
    />
  ))}
</MapView>
```

**`initialRegion` vs `region`:**
- `initialRegion` sets where the map starts. The user can zoom and pan freely — the map does not snap back.
- `region` (controlled) forces the map to always show that exact region. It would fight the user's zoom/pan gestures.

We use `initialRegion` so the map starts centered on campus but lets the user explore freely.

**`onPress` on Marker:** When the user taps a pin, `setSelectedBuilding(building)` updates state. The detail card below the map re-renders with that building's info. Tapping the close button sets `selectedBuilding` back to `null`, hiding the card.

#### 5d. Building list below the map

```tsx
<ScrollView style={styles.listContainer}>
  <Text style={styles.sectionTitle}>Buildings</Text>
  {CAMPUS_BUILDINGS.map((building) => (
    <Pressable
      key={building.id}
      onPress={() => setSelectedBuilding(building)}
    >
      <AppCard
        title={building.title}
        subtitle={building.description}
        right={
          <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
        }
      />
    </Pressable>
  ))}
</ScrollView>
```

The list reuses `AppCard` — same component from Week 7. Each card is tappable and updates `selectedBuilding`, which shows the detail card below the map (and highlights the pin in the `MapView`).

---

### Step 6: Add the Map Tab

**File:** `app/(tab)/_layout.tsx`

Add a `<Tabs.Screen>` for `map` between `courses` and `settings`:

```tsx
<Tabs.Screen
  name="map"
  options={{
    title: "Map",
    tabBarIcon: ({ color, size, focused }) => (
      <Ionicons
        name={focused ? "map" : "map-outline"}
        size={size}
        color={color}
      />
    ),
  }}
/>
```

**Tab order matters.** Expo Router's tab order in the `_layout.tsx` determines the order of tabs in the tab bar. We put Map between Courses and Settings so the 4 tabs are: Home, Courses, Map, Settings.

---

## Common Mistakes <a name="common-mistakes"></a>

### 1. Not checking permission before launching the picker

```tsx
// ❌ WRONG — picker called without permission check
const result = await ImagePicker.launchCameraAsync({ ... });

// ✅ CORRECT — always check permission first
const { status } = await ImagePicker.requestCameraPermissionsAsync();
if (status !== "granted") {
  Alert.alert("Permission Denied", "...");
  return;
}
const result = await ImagePicker.launchCameraAsync({ ... });
```

Without the permission check, the picker will silently fail on devices where permission hasn't been granted. The user sees nothing — no error, no picker. Always check first.

### 2. Reading `result.assets[0]` without checking `result.canceled`

```tsx
// ❌ WRONG — crashes if user pressed Cancel (assets is null)
const uri = result.assets[0].uri;

// ✅ CORRECT — check canceled first
if (!result.canceled) {
  const uri = result.assets[0].uri;
  setPhotoUri(uri);
}
```

If the user presses "Cancel" in the picker, `result.canceled` is `true` and `result.assets` is `null`. Trying to read `.assets[0]` throws a `TypeError`.

### 3. Storing the full base64 image data in AsyncStorage

```tsx
// ❌ WRONG — converts image to base64 and stores megabytes in AsyncStorage
const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: FileSystem.EncodingType.Base64
});
await storage.set("photo", base64);  // potentially 3-5 MB of text

// ✅ CORRECT — store just the URI string (a few hundred characters)
await storage.set(STORAGE_KEYS.PROFILE_PHOTO, uri);
```

AsyncStorage is not designed for large binary data. Store the URI (a short file path) and let the device's file system handle the actual image bytes.

### 4. Using `region` instead of `initialRegion` on MapView

```tsx
// ❌ WRONG — controlled region fights user gestures (map snaps back)
<MapView region={CAMPUS_CENTER} ...>

// ✅ CORRECT — initial region lets user zoom/pan freely
<MapView initialRegion={CAMPUS_CENTER} ...>
```

`region` makes the map "controlled" — it always displays exactly that region. If the user tries to zoom in, the map immediately snaps back to the `CAMPUS_CENTER`. This is extremely annoying UX. `initialRegion` just sets the starting view.

### 5. Forgetting the MapView needs a fixed height

```tsx
// ❌ WRONG — flex: 1 with no parent height = map renders at 0 height
<MapView style={{ flex: 1 }} ...>

// ✅ CORRECT — give MapView a specific height (or fixed-size parent)
<View style={{ height: 300 }}>
  <MapView style={{ flex: 1 }} ...>
</View>

// OR: give MapView a direct height
<MapView style={{ height: 300, width: "100%" }} ...>
```

MapView needs to know how tall it is. `flex: 1` works when the MapView fills the entire screen, but when it's inside a mixed layout (title + map + list), it needs a specific `height`.

### 6. Not handling the location denied case gracefully

```tsx
// ❌ WRONG — throws an error, crashes or shows full error screen
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") throw new Error("No location access");

// ✅ CORRECT — degrade gracefully (map still works without location)
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== "granted") {
  setLocationError("Location access denied. You can still browse the campus map.");
  // Don't return early — let the map render anyway
}
```

The campus map is fully usable without the user's location. A student can still find buildings by browsing. Crashing or showing an error screen because location was denied is bad UX.

### 7. Missing `microphonePermission: false` in the `expo-image-picker` plugin

```json
// ❌ WRONG — on iOS, might request microphone permission unnecessarily
["expo-image-picker", {
  "photosPermission": "...",
  "cameraPermission": "..."
}]

// ✅ CORRECT — explicitly disable microphone
["expo-image-picker", {
  "photosPermission": "...",
  "cameraPermission": "...",
  "microphonePermission": false
}]
```

By default, `expo-image-picker` can record video (which needs a microphone). Setting `microphonePermission: false` tells Expo not to include the microphone permission since we're only using it for photos.

---

## Student Challenge <a name="student-challenge"></a>

### Part 1 — Photo Picker Edge Cases

1. Open your profile screen. Tap the avatar circle — the "Take Photo / Choose from Library" alert should appear.
2. Tap "Choose from Library" and select any photo. The circular avatar should update immediately.
3. Close and reopen the app. Your photo should still be there (loaded from AsyncStorage on mount).
4. Tap the avatar again and select a different photo. Verify the old photo is replaced.
5. **Deny permission:** On your device, go to Settings → Campus Hub → Photos → set to "None." Open the app and try to pick a photo. You should see the "Permission Denied" alert, not a crash.

### Part 2 — Map Interaction

1. Open the Map tab. Confirm all 6 building markers appear.
2. Tap a marker pin — the detail card should appear below the map.
3. Tap the building name in the list below — the same detail card should appear.
4. Tap the ✕ on the detail card — it should disappear.
5. Pinch to zoom in on a specific building. Try panning around campus.

### Part 3 — Bonus: Add a "Go to Campus" Button

Add a button on the map screen that resets the map view back to the campus center when tapped. This requires using a `ref` on `MapView`:

```tsx
import { useRef } from "react";
import MapView from "react-native-maps";

// Inside the component:
const mapRef = useRef<MapView>(null);

const goToCampus = () => {
  mapRef.current?.animateToRegion(CAMPUS_CENTER, 500); // 500ms animation
};

// On MapView:
<MapView ref={mapRef} ... >

// Somewhere on screen:
<Pressable onPress={goToCampus}>
  <Text>Back to Campus</Text>
</Pressable>
```

**What's a `ref`?** A `ref` is a way to hold a direct reference to a rendered component — in this case, the `MapView` instance. It's like grabbing the map component by name and calling a method on it (`animateToRegion`) directly. This is the escape hatch from React's data-driven model for cases where you need to imperatively control a component.

### Part 4 — Double Bonus: "Locate Me" Button

If the user grants location permission, add a "Locate Me" button that zooms the map to the user's current position using `Location.getCurrentPositionAsync()`:

```tsx
const locateMe = async () => {
  if (!locationGranted) return;
  const location = await Location.getCurrentPositionAsync({});
  mapRef.current?.animateToRegion({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
  }, 500);
};
```

---

*This guide builds directly on the patterns from previous weeks: permissions follow the same request-then-use pattern as API calls (ask first, handle denial), the `photoUri` state variable is stored and loaded with the same `storage.ts` utility from Week 9, and the building list uses the same `AppCard` component from Week 7. Week 11 introduces device hardware integration — the same concepts apply to microphone access, biometrics, accelerometer, and other sensors you might use in future apps.*
