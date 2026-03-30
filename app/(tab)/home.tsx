// Week 10: API Calls + Loading States — MODIFIED (fetch dashboard data from API)
// Week 12 - Starter: user email display stub added — wire it in during class
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { theme } from "../../styles/theme";
import * as api from "../../lib/api";
import type { DashboardData } from "../../lib/api";

// Week 12 - Class Code ─────────────────────────────────────────────────────
// TODO: import useAuth
// import { useAuth } from "../../context/AuthContext";
// ──────────────────────────────────────────────────────────────────────────

const Home = () => {
  // Week 12 - Class Code ───────────────────────────────────────────────────
  // TODO: get user from useAuth
  // const { user } = useAuth();
  // ──────────────────────────────────────────────────────────────────────────

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const result = await api.getDashboard();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={theme.colors.muted} />
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadDashboard}>
          <Text style={styles.retryText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Campus Hub</Text>
      <Text style={styles.p}>{data?.greeting} — here's your overview</Text>

      {/* Week 12 - Class Code ──────────────────────────────────────────────
          TODO: show the signed-in user's email below the greeting
          {user?.email && (
            <Text style={styles.userEmail}>{user.email}</Text>
          )}
      ─────────────────────────────────────────────────────────────────────── */}

      <AppCard
        title="Upcoming Deadline"
        subtitle={`${data?.nextDeadline.course} ${data?.nextDeadline.title} — due ${data?.nextDeadline.dueDate}`}
        right={
          <Ionicons name="alert-circle-outline" size={22} color={theme.colors.primary} />
        }
      />

      <AppCard
        title="Attendance"
        subtitle={`${data?.attendance.attended}/${data?.attendance.total} classes — ${data?.attendance.percentage}%`}
        right={
          <Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.primary} />
        }
      />
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.screen,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    padding: theme.spacing.screen,
  },
  h1: { fontSize: 28, fontWeight: "800", color: theme.colors.text },
  p: { marginTop: 6, marginBottom: 4, color: theme.colors.muted },
  // Week 12 - Class Code: add this style when wiring in user email
  userEmail: { fontSize: 13, color: theme.colors.primary, marginBottom: 16 },
  errorText: { marginTop: 12, fontSize: 16, color: theme.colors.muted, textAlign: "center" },
  retryButton: {
    marginTop: 20, paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: theme.radius.input, backgroundColor: theme.colors.primary,
  },
  retryText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
});
