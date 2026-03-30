// Week 12 - Starter
// Entry point — currently sends everyone to the home tab.
// Your job: check the session and redirect to /login if not signed in.
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { theme } from "../styles/theme";

// Week 12 - Class Code ─────────────────────────────────────────────────────
// TODO 1: import useAuth
// import { useAuth } from "../context/AuthContext";
// ──────────────────────────────────────────────────────────────────────────

const Index = () => {
  // Week 12 - Class Code ───────────────────────────────────────────────────
  // TODO 2: get session and isLoading from useAuth
  // const { session, isLoading } = useAuth();
  //
  // TODO 3: show a spinner while AsyncStorage is being read
  // if (isLoading) {
  //   return (
  //     <View style={styles.centered}>
  //       <ActivityIndicator size="large" color={theme.colors.primary} />
  //     </View>
  //   );
  // }
  //
  // TODO 4: redirect based on session
  // return <Redirect href={session ? "/(tab)/home" : "/login"} />;
  // ──────────────────────────────────────────────────────────────────────────

  // Week 12 - Starter: remove this line once TODOs above are done
  return <Redirect href="/(tab)/home" />;
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
