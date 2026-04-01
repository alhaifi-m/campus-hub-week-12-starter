// Week 12: Supabase Auth — MODIFIED
// Wraps the entire app in AuthProvider and adds AuthGuard for protected routes.
//
// AuthGuard pattern:
//   - Watches session + current route segments
//   - If no session + inside (tab) group → redirect to /login
//   - If session exists + on login/signup → redirect to /(tab)/home
//   This means every protected screen is automatically guarded — no manual
//   checks needed in each tab screen.
import React, { Children, useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Week 12 - Class Code: import AuthProvider and useAuth

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  // ['(tab)', 'home'] for /(tab)/home
  const router = useRouter();

  useEffect(() => {
    const inTabGroup = segments[0] === "(tab)";
    if (!session && inTabGroup) {
      router.replace("/login");
    } else if (session && !inTabGroup) {
      router.replace("/(tab)/home");
    }
  }, [session, segments, isLoading]);

  if (isLoading) return null;

  return <>{children}</>;
};

// Week 12 - Class Code: add AuthGuard component here

// ── Root Layout ───────────────────────────────────────────────────────────────

const RootLayout = () => {
  // Week 12 - Class Code: wrap Stack with AuthProvider and AuthGuard
  return (
    <AuthProvider>
      <AuthGuard>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tab)" />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack>
      </AuthGuard>
    </AuthProvider>
  );
};

export default RootLayout;
