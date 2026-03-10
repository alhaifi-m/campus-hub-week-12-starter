// Week 11: Camera + Maps — NEW file (campus map with building markers + user location)
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import AppCard from "../../components/AppCard";
import { theme } from "../../styles/theme";

// ── Campus building data ──────────────────────────────────────
// Each building has an ID, display name, description, and GPS coordinates.
// Latitude/longitude values are in decimal degrees.

type Building = {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
};

const CAMPUS_BUILDINGS: Building[] = [
  {
    id: "main",
    title: "Main Building",
    description: "Administration, Registrar, classrooms T100–T400",
    coordinate: { latitude: 51.0642, longitude: -114.0878 },
  },
  {
    id: "library",
    title: "Library & Learning Commons",
    description: "Study spaces, computer labs, printing services",
    coordinate: { latitude: 51.0648, longitude: -114.0862 },
  },
  {
    id: "sciences",
    title: "Sciences Building",
    description: "Classrooms S100–S300, biology and chemistry labs",
    coordinate: { latitude: 51.0635, longitude: -114.0895 },
  },
  {
    id: "recreation",
    title: "Recreation Centre",
    description: "Fitness centre, pool, gym courts, student locker rooms",
    coordinate: { latitude: 51.0658, longitude: -114.0885 },
  },
  {
    id: "cafeteria",
    title: "Student Hub & Cafeteria",
    description: "Food court, student services, student association lounge",
    coordinate: { latitude: 51.063, longitude: -114.087 },
  },
  {
    id: "parking",
    title: "North Parking Lot",
    description: "Student parking — Lot N1 and N2",
    coordinate: { latitude: 51.0665, longitude: -114.0875 },
  },
];

// The initial map region — centered on campus, zoomed in enough to see all buildings
const CAMPUS_CENTER: Region = {
  latitude: 51.0648,
  longitude: -114.0878,
  latitudeDelta: 0.008, // height of visible map area in degrees (~900m)
  longitudeDelta: 0.008, // width of visible map area in degrees (~700m)
};

// ── Component ─────────────────────────────────────────────────

const CampusMap = () => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Request location permission on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status === "granted") {
      setLocationGranted(true);
    } else {
      setLocationError(
        "Location access denied. You can still browse the campus map."
      );
    }

    setIsLoadingLocation(false);
  };

  // ── Render: loading while we check permissions ──
  if (isLoadingLocation) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Campus Map</Text>

      {/* Optional: show a soft banner if location was denied */}
      {locationError && (
        <View style={styles.locationBanner}>
          <Ionicons
            name="location-outline"
            size={16}
            color={theme.colors.muted}
          />
          <Text style={styles.locationBannerText}>{locationError}</Text>
        </View>
      )}

      {/* ── Map ── */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={CAMPUS_CENTER}
          showsUserLocation={locationGranted} // blue dot for user's position
          showsMyLocationButton={locationGranted} // button to re-center on user
        >
          {CAMPUS_BUILDINGS.map((building) => (
            <Marker
              key={building.id}
              coordinate={building.coordinate}
              title={building.title}
              description={building.description}
              onPress={() => setSelectedBuilding(building)}
            />
          ))}
        </MapView>
      </View>

      {/* ── Selected building detail card ── */}
      {selectedBuilding && (
        <View style={styles.selectedCard}>
          <AppCard
            title={selectedBuilding.title}
            subtitle={selectedBuilding.description}
            right={
              <Pressable onPress={() => setSelectedBuilding(null)}>
                <Ionicons
                  name="close-circle-outline"
                  size={22}
                  color={theme.colors.muted}
                />
              </Pressable>
            }
          />
        </View>
      )}

      {/* ── Building list ── */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Buildings</Text>

        {CAMPUS_BUILDINGS.map((building) => (
          <Pressable
            key={building.id}
            onPress={() => setSelectedBuilding(building)}
          >
            <AppCard
              title={building.title}
              subtitle={building.description}
              right={
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.colors.primary}
                />
              }
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

export default CampusMap;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
  h1: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.screen,
    paddingTop: theme.spacing.screen,
    paddingBottom: 8,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: theme.spacing.screen,
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  locationBannerText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.muted,
  },
  mapContainer: {
    height: 300,
    marginHorizontal: theme.spacing.screen,
    borderRadius: theme.radius.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  map: {
    flex: 1,
  },
  selectedCard: {
    marginHorizontal: theme.spacing.screen,
    marginTop: 10,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.screen,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
});
