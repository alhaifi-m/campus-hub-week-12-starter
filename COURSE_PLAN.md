# Campus Hub — Weeks 7–14 Mobile Development Course Plan

## Course Overview

Students build a complete, production-ready mobile app (**Campus Hub**) over 8 weeks using React Native (Expo). Each week introduces one module that adds a real feature to the app. Students only see the current week's material — no peeking ahead.

**Prerequisites (Weeks 1–6):** Students have completed 6 weeks of foundation and TypeScript. They should already understand the existing app structure:
- File-based routing with Expo Router
- Stack navigation and Tab navigation
- Nested navigation (Stack inside a Tab)
- Reusable components (`AppCard`) and centralized theming (`theme.ts`)

**Starting Point:** The current Campus Hub app with 3 tabs (Home, Courses, Settings), hardcoded data, and no backend.

---

## Weekly Breakdown

```
WEEK    MODULE                          HRS    STATUS
────    ──────                          ───    ──────
 7      Routing (Foundation)            4      [x]
 8      Forms + Validation              4      [x]
 9      Local Storage                   4      [x]
10      API Calls + Loading States      4      [x]
11      Camera + Maps                   4      [ ]
12      Supabase Auth                   4      [ ]
13      Supabase DB + Sync             4      [ ]
14      Notifications + Deployment      4      [ ]
                                       ───
                                Total: 32 hrs
```

---

## Week 7 — Routing (Foundation)

**Duration:** 4 hours

**What gets built:** The app shell — 3-tab layout with Stack navigation inside the Courses tab.

**Key concepts:**
- File-based routing with Expo Router
- Stack navigation (push/pop)
- Tab navigation (horizontal switching)
- Nested navigation (Stack inside a Tab)
- Dynamic routes (`[id].tsx`)

**See:** `ROUTING_GUIDE.md` for the full walkthrough.

**By end of week:** Students understand how navigation works in React Native and can build any routing structure.

---

## Week 8 — Forms + Validation

**Duration:** 4 hours (2 hr + 2 hr)

**What gets built:** An "Edit Profile" screen with validated form fields (name, email, student ID).

| First Half (2 hrs) | Second Half (2 hrs) |
|---------------------|---------------------|
| React state (`useState`) | Validation rules & logic |
| Controlled inputs (`TextInput`) | Error messages & UX feedback |
| Form layout & design | Submit handling |
| Two-way data binding | Disabling submit until valid |

**New concepts introduced:**
- Controlled vs uncontrolled components
- State-driven UI
- Form validation patterns
- User feedback (inline errors, button states)

**Files added/modified:**
- `app/(tab)/settings.tsx` — updated to navigate to profile edit
- `app/(tab)/profile/` — new screens for the profile form (or integrated into settings)

**By end of week:** Students can build any form, validate user input, and show meaningful error messages.

---

## Week 9 — Local Storage

**Duration:** 4 hours (2 hr + 2 hr)

**What gets built:** Profile data and user preferences persist across app restarts.

| First Half (2 hrs) | Second Half (2 hrs) |
|---------------------|---------------------|
| AsyncStorage / SecureStore setup | Persist user preferences |
| Read & write patterns | Load saved data on app launch |
| When to use local vs secure storage | Settings toggle persistence |
| Key-value storage concepts | Hydration pattern |

**New concepts introduced:**
- Async/await with storage operations
- App lifecycle — data loading on mount
- Secure vs regular storage (passwords vs preferences)
- The concept of hydration (loading saved state)

**Files added/modified:**
- New utility/helper for storage operations
- Settings screen — toggle states persist
- Profile form — saved data loads on revisit

**By end of week:** Students understand client-side persistence and when to use it vs a backend.

---

## Week 10 — API Calls + Loading States

**Duration:** 4 hours (2 hr + 2 hr)

**What gets built:** Courses load from an external API instead of hardcoded data. Proper loading and error states.

| First Half (2 hrs) | Second Half (2 hrs) |
|---------------------|---------------------|
| `fetch()` and `async/await` | Loading spinners (`ActivityIndicator`) |
| `useEffect` for data fetching | Error states and retry buttons |
| Replace hardcoded `COURSES` array | Empty states (no data) |
| JSON parsing and response handling | Pull-to-refresh |

**New concepts introduced:**
- Side effects with `useEffect`
- The fetch lifecycle: idle → loading → success/error
- Network reliability — things will fail
- UI states: loading, error, empty, data

**Files added/modified:**
- `app/(tab)/courses/index.tsx` — fetch replaces hardcoded array
- `app/(tab)/courses/[id].tsx` — fetch individual course details
- Home screen — dynamic data for deadlines/attendance

**By end of week:** Students never hardcode data again. They understand async data flow and defensive UI.

---

## Week 11 — Camera + Maps

**Duration:** 4 hours (2 hr Camera + 2 hr Maps)

**What gets built:** Student profile photo via camera/gallery. Campus map with building locations.

### First Half — Camera (2 hrs)

| Topics |
|--------|
| `expo-image-picker` setup |
| Camera vs gallery permissions |
| Capturing and previewing an image |
| Saving the photo to profile |
| Permission handling patterns |

### Second Half — Maps (2 hrs)

| Topics |
|--------|
| `react-native-maps` setup |
| Rendering a map with initial region |
| Adding markers/pins for campus buildings |
| User's current location |
| Basic map interaction (zoom, pan) |

**New concepts introduced:**
- Device permissions model (ask → granted/denied)
- Native module integration (camera, maps)
- Platform differences (iOS vs Android setup)
- Working with coordinates (latitude/longitude)

**Files added/modified:**
- Profile screen — image picker integration
- New "Campus Map" screen or tab
- `app.json` — permission descriptions

**By end of week:** Students can access device hardware and display interactive maps.

---

## Week 12 — Supabase Auth

**Duration:** 4 hours (2 hr + 2 hr)

**What gets built:** Full login/sign-up flow. Unauthenticated users can't access the app.

| First Half (2 hrs) | Second Half (2 hrs) |
|---------------------|---------------------|
| Supabase project setup | Auth context provider |
| Sign-up with email/password | Protected routes (redirect if not logged in) |
| Login flow | Session persistence |
| Supabase client config | Logout functionality |

**New concepts introduced:**
- Authentication vs authorization
- React Context API (sharing auth state globally)
- Protected routes pattern
- JWT tokens and sessions (conceptual)
- Environment variables (API keys)

**Files added/modified:**
- New `lib/supabase.ts` — client setup
- New `context/auth.tsx` — auth provider
- `app/_layout.tsx` — wraps app with auth provider
- New login/sign-up screens
- Redirect logic for unauthenticated users

**By end of week:** Students understand auth flows and can protect any screen in any app.

---

## Week 13 — Supabase Database + Sync

**Duration:** 4 hours (2 hr + 2 hr)

**What gets built:** Real course data, grades, and attendance stored in Supabase. Real-time updates.

| First Half (2 hrs) | Second Half (2 hrs) |
|---------------------|---------------------|
| Supabase table design | Real-time subscriptions |
| Row Level Security (RLS) basics | Live data updates in the UI |
| CRUD: Create, Read, Update, Delete | Optimistic updates |
| Linking data to authenticated user | Offline handling basics |

**New concepts introduced:**
- Relational database basics (tables, rows, foreign keys)
- CRUD operations from a mobile client
- Row Level Security — users only see their own data
- Real-time data (subscriptions vs polling)
- Optimistic UI updates

**Files added/modified:**
- Courses list — reads from Supabase
- Course details — real grades and attendance
- Home dashboard — live data
- Supabase dashboard — table setup (taught in class)

**By end of week:** Students can build any data-driven app with a real backend. The hardcoded era is over.

---

## Week 14 — Notifications + Security & Deployment

**Duration:** 4 hours (2 hr Notifications + 2 hr Deployment)

**What gets built:** Push notifications for deadline reminders. App prepared for store submission.

### First Half — Notifications (2 hrs)

| Topics |
|--------|
| `expo-notifications` setup |
| Requesting notification permissions |
| Local notifications (scheduled) |
| Push notifications with Supabase triggers |
| Notification handling (app open vs background) |

### Second Half — Security & Deployment (2 hrs)

| Topics |
|--------|
| Environment variables (`.env`, no secrets in code) |
| Common security mistakes (OWASP mobile top 10) |
| EAS Build setup |
| App signing (Android keystore, iOS certificates) |
| Store submission checklist |
| Final review of full app architecture |

**New concepts introduced:**
- Push notification lifecycle (register → send → receive)
- Foreground vs background notification handling
- Secret management (never commit API keys)
- App signing and code integrity
- The full journey: code → build → store → user's phone

**Files added/modified:**
- Notification setup and handlers
- `.env` file (gitignored) for secrets
- `eas.json` — build configuration
- Final architecture review of all files

**By end of week:** Students have a complete, secure, deployable app and understand the full mobile development lifecycle.

---

## Final App Architecture (After All 8 Weeks)

```
campus-hub/
├── app/
│   ├── _layout.tsx                 ← Root Stack + Auth Provider
│   ├── index.tsx                   ← Redirect (auth check)
│   ├── login.tsx                   ← Week 12
│   ├── signup.tsx                  ← Week 12
│   └── (tab)/
│       ├── _layout.tsx             ← Tab Navigator
│       ├── home.tsx                ← Live dashboard (Week 13)
│       ├── settings.tsx            ← Persisted prefs (Week 9)
│       ├── map.tsx                 ← Campus map (Week 11)
│       └── courses/
│           ├── _layout.tsx         ← Stack Navigator
│           ├── index.tsx           ← API/Supabase list (Week 10/13)
│           └── [id].tsx            ← Real course details (Week 13)
├── components/
│   ├── AppCard.tsx                 ← Week 7 (existing)
│   └── ProfileForm.tsx            ← Week 8
├── context/
│   └── auth.tsx                   ← Week 12
├── lib/
│   ├── supabase.ts                ← Week 12
│   └── storage.ts                 ← Week 9
├── styles/
│   └── theme.ts                   ← Week 7 (existing)
└── .env                           ← Week 14 (gitignored)
```

---

## Documentation Structure

All materials are organized under `docs/`:

```
docs/
├── student/       ← Guides students can see (committed to repo)
├── instructor/    ← Teaching plans (gitignored)
└── labs/          ← Lab exercises students can see (committed to repo)
```

### Student Guides

| Week | File | Status |
|------|------|--------|
| 7 | `docs/student/ROUTING_GUIDE.md` | ✅ Complete |
| 8 | `docs/student/WEEK8_FORMS.md` | ✅ Complete |
| 9 | `docs/student/WEEK9_LOCAL_STORAGE.md` | ✅ Complete |
| 10 | `docs/student/WEEK10_API_CALLS.md` | ✅ Complete |
| 11 | `docs/student/WEEK11_CAMERA_MAPS.md` | [ ] |
| 12 | `docs/student/WEEK12_SUPABASE_AUTH.md` | [ ] |
| 13 | `docs/student/WEEK13_SUPABASE_DB.md` | [ ] |
| 14 | `docs/student/WEEK14_NOTIFICATIONS_DEPLOY.md` | [ ] |

Each guide follows this structure:
1. **Before vs After** — what the app looks like before and after this module
2. **Architecture Impact** — what files are added or changed and why
3. **New Concepts** — explained with analogies for beginners
4. **Step-by-Step Implementation** — every code block explained
5. **Common Mistakes** — gotchas and how to avoid them
6. **Student Challenge** — a mini task to try on their own

### Instructor Plans (gitignored)

| Week | File | Status |
|------|------|--------|
| 7 | `docs/instructor/WEEK7_INSTRUCTOR.md` | [ ] |
| 8 | `docs/instructor/WEEK8_INSTRUCTOR.md` | ✅ Complete |
| 9 | `docs/instructor/WEEK9_INSTRUCTOR.md` | ✅ Complete |
| 10 | `docs/instructor/WEEK10_INSTRUCTOR.md` | ✅ Complete |
| 11 | `docs/instructor/WEEK11_INSTRUCTOR.md` | [ ] |
| 12 | `docs/instructor/WEEK12_INSTRUCTOR.md` | [ ] |
| 13 | `docs/instructor/WEEK13_INSTRUCTOR.md` | [ ] |
| 14 | `docs/instructor/WEEK14_INSTRUCTOR.md` | [ ] |

### Labs

| Week | File | Status |
|------|------|--------|
| 7 | `docs/labs/LAB7_ROUTING.md` | ✅ Complete |
| 8 | `docs/labs/LAB8_FORMS.md` | ✅ Complete |
| 9 | `docs/labs/LAB9_LOCAL_STORAGE.md` | ✅ Complete |
| 10 | `docs/labs/LAB10_API_CALLS.md` | ✅ Complete |
| 11 | `docs/labs/LAB11_CAMERA_MAPS.md` | [ ] |
| 12 | `docs/labs/LAB12_SUPABASE_AUTH.md` | [ ] |
| 13 | `docs/labs/LAB13_SUPABASE_DB.md` | [ ] |
| 14 | `docs/labs/LAB14_NOTIFICATIONS_DEPLOY.md` | [ ] |

---

*This plan is designed for the Campus Hub Expo Router project. Each week builds on the previous one — no module can be skipped or reordered without adjusting dependencies.*
