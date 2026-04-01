// Week 12: Supabase Auth — MODIFIED
// Initial redirect based on auth state.
// AuthGuard in _layout.tsx handles ongoing protection after navigation.
// This file handles the first render when the app opens cold.
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
// Week 12 - Class Code: import useAuth
import { theme } from "../styles/theme";

const Index = () => {
  const { session, isLoading } = useAuth();

  if(isLoading){
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  // Week 12 - Class Code: replace this with session check + spinner + conditional redirect
  return <Redirect href={ session ? "/(tab)/home" : "/login" } />;
};

export default Index;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
});
