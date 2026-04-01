// Week 12: Supabase Auth — MODIFIED
// Wraps the entire app in AuthProvider and adds AuthGuard for protected routes.
//
// AuthGuard pattern:
//   - Watches session + current route segments
//   - If no session + inside (tab) group → redirect to /login
//   - If session exists + on login/signup → redirect to /(tab)/home
//   This means every protected screen is automatically guarded — no manual
//   checks needed in each tab screen.
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";

// Week 12 - Class Code: import AuthProvider and useAuth

// Week 12 - Class Code: add AuthGuard component here

// ── Root Layout ───────────────────────────────────────────────────────────────

const RootLayout = () => {
  // Week 12 - Class Code: wrap Stack with AuthProvider and AuthGuard
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};

export default RootLayout;
