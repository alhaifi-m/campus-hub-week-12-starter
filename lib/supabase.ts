// Week 12 - Starter
// Supabase client — single connection point between the app and Supabase.
// The URL and key come from .env (gitignored).
// EXPO_PUBLIC_ prefix makes them available in the JS bundle at build time.
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

// ── Week 12 - Class Code ───────────────────────────────────────────────────
// TODO: Create and export the Supabase client.
//
// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: AsyncStorage,      // persist session across app restarts
//     autoRefreshToken: true,     // silently refresh JWTs before they expire
//     persistSession: true,       // save session to AsyncStorage on sign in
//     detectSessionInUrl: false,  // disable browser URL parsing (native app)
//   },
// });
// ──────────────────────────────────────────────────────────────────────────
