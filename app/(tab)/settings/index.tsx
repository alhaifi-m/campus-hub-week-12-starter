// Week 9: Local Storage — MODIFIED (added persistence for notifications toggle)
// Week 12 - Starter: Sign Out stub added — wire it in during class
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../../components/AppCard";
import { theme } from "../../../styles/theme";
import * as storage from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/storage";

// Week 12 - Class Code ─────────────────────────────────────────────────────
// TODO: import useAuth
// import { useAuth } from "../../../context/AuthContext";
// ──────────────────────────────────────────────────────────────────────────

const Settings = () => {
  // Week 12 - Class Code ───────────────────────────────────────────────────
  // TODO: get signOut from useAuth
  // const { signOut } = useAuth();
  // ──────────────────────────────────────────────────────────────────────────

  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      const saved = await storage.get<boolean>(STORAGE_KEYS.NOTIFICATIONS);
      if (saved !== null) setNotifications(saved);
      setIsLoading(false);
    };
    loadNotifications();
  }, []);

  const handleToggle = async (value: boolean) => {
    setNotifications(value);
    await storage.set(STORAGE_KEYS.NOTIFICATIONS, value);
  };

  // Week 12 - Class Code ───────────────────────────────────────────────────
  // TODO: add handleSignOut — call signOut() then let AuthGuard redirect
  // const handleSignOut = async () => {
  //   await signOut();
  // };
  // ──────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Settings</Text>

      <AppCard
        title="Notifications"
        subtitle="Enable app notifications"
        right={<Switch value={notifications} onValueChange={handleToggle} />}
      />

      <Pressable onPress={() => router.push("/(tab)/settings/profile")}>
        <AppCard
          title="Account"
          subtitle="Update profile settings"
          right={<Ionicons name="chevron-forward" size={20} color={theme.colors.muted} />}
        />
      </Pressable>

      {/* Week 12 - Class Code ──────────────────────────────────────────────
          TODO: add the Sign Out card below the Account card
          <Pressable onPress={handleSignOut}>
            <AppCard
              title="Sign Out"
              subtitle="Sign out of your account"
              right={<Ionicons name="log-out-outline" size={20} color={theme.colors.error} />}
            />
          </Pressable>
      ─────────────────────────────────────────────────────────────────────── */}
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.screen,
    backgroundColor: theme.colors.bg,
  },
  h1: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
    color: theme.colors.text,
  },
});
