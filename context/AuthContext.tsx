// Week 12 - Starter
// AuthContext — shares auth state across the entire app.
// Any screen calls useAuth() to read session/user or trigger signIn/signUp/signOut.
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ── Week 12 - Starter: Types ───────────────────────────────────────────────
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);
// ──────────────────────────────────────────────────────────────────────────

// ── Week 12 - Starter: Provider shell ─────────────────────────────────────
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  // Week 12 - Class Code ───────────────────────────────────────────────────
  // TODO 1: Add state for session and isLoading
  // const [session, setSession] = useState<Session | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  // TODO 2: Add useEffect to load existing session + subscribe to auth changes
  // useEffect(() => {
  //   supabase.auth.getSession()
  //     .then(({ data: { session } }) => { setSession(session); })
  //     .catch(() => { setSession(null); })
  //     .finally(() => { setIsLoading(false); });
  //
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     (_event, session) => { setSession(session); }
  //   );
  //   return () => subscription.unsubscribe();
  // }, []);

  // TODO 3: Implement signIn, signUp, signOut
  // const signIn = async (email: string, password: string) => {
  //   const { error } = await supabase.auth.signInWithPassword({ email, password });
  //   if (error) throw error;
  // };
  // const signUp = async (email: string, password: string) => {
  //   const { error } = await supabase.auth.signUp({ email, password });
  //   if (error) throw error;
  // };
  // const signOut = async () => {
  //   const { error } = await supabase.auth.signOut();
  //   if (error) throw error;
  // };
  // ──────────────────────────────────────────────────────────────────────────

  // Week 12 - Class Code: replace these placeholders with real state values
  const session = null as Session | null;
  const isLoading = false;
  const signIn = async (_email: string, _password: string) => {};
  const signUp = async (_email: string, _password: string) => {};
  const signOut = async () => {};

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// ──────────────────────────────────────────────────────────────────────────

// ── Week 12 - Starter: useAuth hook ───────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside <AuthProvider>");
  }
  return context;
};
// ──────────────────────────────────────────────────────────────────────────
