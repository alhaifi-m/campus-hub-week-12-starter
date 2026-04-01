// Week 12: Supabase Auth — NEW file
// ─────────────────────────────────────────────────────────────────────────────
// AuthContext — shares auth state (session, user) across the entire app.
//
// Pattern:
//   1. AuthProvider wraps the entire app in _layout.tsx
//   2. Any screen calls useAuth() to read session/user or call signIn/signUp/signOut
//   3. The session state is the single source of truth — set by Supabase's listener
//
// Why Context API?
//   Auth state is needed everywhere: the tab navigator needs to know if the
//   user is logged in. The home screen shows the user's email. The settings
//   screen has a logout button. Passing this through props would be a nightmare.
//   Context gives every component access without prop drilling.
// ─────────────────────────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { email } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthContextType = {
  session: Session | null;         // null = not signed in
  user: User | null;               // shortcut for session?.user
  isLoading: boolean;              // true while loading session from storage
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // Week 12 - Class Code: replace these placeholders with real state + effects
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check if there's an active session on mount
    // 2. Listen for auth state changes and update session accordingly
    supabase.auth.getSession()
      .then(({data : {session}})=>{
        setSession(session);
      })
      .finally(()=>{
        setIsLoading(false);
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      
    // Cleanup subscription on unmount
    return () => subscription.unsubscribe()
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

// useAuth() — call this from any screen to read auth state or trigger auth actions.
// Throws if called outside of <AuthProvider> — a hard error is better than silent null.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside <AuthProvider>");
  }
  return context;
};
