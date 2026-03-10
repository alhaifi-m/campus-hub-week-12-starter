// Week 11: Camera + Maps — MODIFIED (added profile photo via expo-image-picker)
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../../styles/theme";
import * as storage from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/storage";

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  phone: string;
};

type FormErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  studentId?: string;
  phone?: string;
};

const Profile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null); // ← Week 11: profile photo

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  // Load saved profile data and photo on mount
  useEffect(() => {
    async function loadProfile() {
      const saved = await storage.get<ProfileData>(STORAGE_KEYS.PROFILE);
      if (saved !== null) {
        setFirstName(saved.firstName);
        setLastName(saved.lastName);
        setEmail(saved.email);
        setStudentId(saved.studentId);
        setPhone(saved.phone);
        setHasSavedData(true);
      } else {
        setIsEditing(true);
      }

      // Week 11: Load saved photo URI
      const savedPhoto = await storage.get<string>(STORAGE_KEYS.PROFILE_PHOTO);
      if (savedPhoto !== null) {
        setPhotoUri(savedPhoto);
      }

      setIsLoading(false);
    }
    loadProfile();
  }, []);

  // ── Week 11: Photo picker ─────────────────────────────────

  // Show an action sheet-style alert to choose camera or library
  const handlePhotoPress = () => {
    Alert.alert("Profile Photo", "Choose a source", [
      { text: "Take Photo", onPress: () => openPicker("camera") },
      { text: "Choose from Library", onPress: () => openPicker("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openPicker = async (source: "camera" | "library") => {
    // Step 1: Request the appropriate permission
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Camera access is required to take a profile photo. Enable it in Settings."
        );
        return;
      }
    } else {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Photo library access is required to choose a profile photo. Enable it in Settings."
        );
        return;
      }
    }

    // Step 2: Launch the picker
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1], // square crop
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1], // square crop
            quality: 0.8,
          });

    // Step 3: Save the URI if the user didn't cancel
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await storage.set(STORAGE_KEYS.PROFILE_PHOTO, uri);
    }
  };

  // ── Form helpers (unchanged from Week 9) ─────────────────

  const isFormFilled =
    firstName.length > 0 &&
    lastName.length > 0 &&
    email.length > 0 &&
    studentId.length > 0 &&
    phone.length > 0;

  const validate = () => {
    const newErrors: FormErrors = {};

    if (firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }
    if (lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (studentId.trim().length !== 9) {
      newErrors.studentId = "Student ID must be exactly 9 characters.";
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      newErrors.phone = "Phone number must have at least 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const profileData: ProfileData = {
      firstName,
      lastName,
      email,
      studentId,
      phone,
    };
    await storage.set(STORAGE_KEYS.PROFILE, profileData);

    setErrors({});
    setHasSavedData(true);
    setIsEditing(false);
  };

  const handleCancel = async () => {
    const saved = await storage.get<ProfileData>(STORAGE_KEYS.PROFILE);
    if (saved !== null) {
      setFirstName(saved.firstName);
      setLastName(saved.lastName);
      setEmail(saved.email);
      setStudentId(saved.studentId);
      setPhone(saved.phone);
    }
    setErrors({});
    setIsEditing(false);
  };

  // ── Shared avatar component (shown in both view and edit mode) ──

  const renderAvatar = () => (
    <View style={styles.avatarSection}>
      <Pressable onPress={handlePhotoPress} style={styles.avatarContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-outline" size={44} color={theme.colors.muted} />
          </View>
        )}
        {/* Camera badge overlay */}
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={14} color="#ffffff" />
        </View>
      </Pressable>
      <Text style={styles.photoHint}>
        {photoUri ? "Tap to change photo" : "Tap to add photo"}
      </Text>
    </View>
  );

  // ── Loading state ─────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // ── VIEW MODE ─────────────────────────────────────────────

  if (!isEditing) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.h1}>My Profile</Text>

        {renderAvatar()}

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>First Name</Text>
            <Text style={styles.profileValue}>{firstName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Last Name</Text>
            <Text style={styles.profileValue}>{lastName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Student ID</Text>
            <Text style={styles.profileValue}>{studentId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Phone</Text>
            <Text style={styles.profileValue}>{phone}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── EDIT MODE ─────────────────────────────────────────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Edit Profile</Text>

      {renderAvatar()}

      {/* First Name */}
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={[styles.input, errors.firstName && styles.inputError]}
        placeholder="e.g. Jane"
        placeholderTextColor={theme.colors.muted}
        value={firstName}
        onChangeText={setFirstName}
        autoCapitalize="words"
      />
      {errors.firstName && <Text style={styles.error}>{errors.firstName}</Text>}

      {/* Last Name */}
      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={[styles.input, errors.lastName && styles.inputError]}
        placeholder="e.g. Smith"
        placeholderTextColor={theme.colors.muted}
        value={lastName}
        onChangeText={setLastName}
        autoCapitalize="words"
      />
      {errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, errors.email && styles.inputError]}
        placeholder="e.g. jane.smith@edu.ca"
        placeholderTextColor={theme.colors.muted}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}

      {/* Student ID */}
      <Text style={styles.label}>Student ID</Text>
      <TextInput
        style={[styles.input, errors.studentId && styles.inputError]}
        placeholder="e.g. A00123456"
        placeholderTextColor={theme.colors.muted}
        value={studentId}
        onChangeText={setStudentId}
        autoCapitalize="characters"
        maxLength={9}
      />
      {errors.studentId && (
        <Text style={styles.error}>{errors.studentId}</Text>
      )}

      {/* Phone Number */}
      <Text style={styles.label}>Phone Number</Text>
      <TextInput
        style={[styles.input, errors.phone && styles.inputError]}
        placeholder="e.g. (403) 555-0123"
        placeholderTextColor={theme.colors.muted}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

      {/* Buttons */}
      {hasSavedData ? (
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !isFormFilled && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormFilled}
          >
            <Text style={styles.buttonText}>Save Profile</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.button, !isFormFilled && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormFilled}
        >
          <Text style={styles.buttonText}>Save Profile</Text>
        </Pressable>
      )}
    </ScrollView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    padding: theme.spacing.screen,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
  h1: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 20,
    color: theme.colors.text,
  },

  // ── Avatar styles (Week 11) ──────────────────────────────
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.bg,
  },
  photoHint: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.muted,
  },

  // ── View mode styles (unchanged) ─────────────────────────
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  profileRow: {
    padding: 16,
  },
  profileLabel: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },

  // ── Edit mode styles (unchanged) ─────────────────────────
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 14,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: {
    color: theme.colors.error,
    fontSize: 13,
    marginTop: 4,
  },

  // ── Button styles (unchanged) ────────────────────────────
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.input,
    padding: 16,
    alignItems: "center",
    marginTop: 28,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },
  cancelButton: {
    flex: 1,
    borderRadius: theme.radius.input,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.input,
    padding: 16,
    alignItems: "center",
  },
});
