// Week 12 - Starter
// Root layout — the Stack is pre-built with login and signup screens registered.
// Your job: add AuthProvider + AuthGuard to protect the tab routes.
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";

// Week 12 - Class Code ─────────────────────────────────────────────────────
// TODO 1: import AuthProvider and useAuth
// import { AuthProvider, useAuth } from "../context/AuthContext";
// ──────────────────────────────────────────────────────────────────────────

// Week 12 - Class Code ─────────────────────────────────────────────────────
// TODO 2: Build the AuthGuard component here.
//
// const AuthGuard = ({ children }: { children: React.ReactNode }) => {
//   const { session, isLoading } = useAuth();
//   const segments = useSegments();   // e.g. ["(tab)", "home"] or ["login"]
//   const router = useRouter();
//
//   useEffect(() => {
//     if (isLoading) return;
//     const inTabGroup = segments[0] === "(tab)";
//     if (!session && inTabGroup) router.replace("/login");
//     else if (session && !inTabGroup) router.replace("/(tab)/home");
//   }, [session, isLoading, segments]);
//
//   if (isLoading) return null;
//   return <>{children}</>;
// };
// ──────────────────────────────────────────────────────────────────────────

// ── Week 12 - Starter: Root layout ────────────────────────────────────────
const RootLayout = () => {
  return (
    // Week 12 - Class Code ─────────────────────────────────────────────────
    // TODO 3: Wrap Stack with <AuthProvider> and <AuthGuard>
    // <AuthProvider>
    //   <AuthGuard>
    //     <Stack ...>
    //   </AuthGuard>
    // </AuthProvider>
    // ────────────────────────────────────────────────────────────────────────
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tab)" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};

export default RootLayout;
