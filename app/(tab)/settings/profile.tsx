// Week 11: Camera + Maps — MODIFIED (added profile photo via expo-image-picker, built on Week 9 RHF + Zod)
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert, // Week 11
  Image, // Week 11
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Week 11
import { Ionicons } from "@expo/vector-icons"; // Week 11
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { theme } from "../../../styles/theme";
import * as storage from "../../../lib/storage";
import { STORAGE_KEYS } from "../../../lib/storage";

// Zod schema — unchanged from Week 8
const profileSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters."),
  lastName:  z.string().trim().min(2, "Last name must be at least 2 characters."),
  email:     z.string().trim().email("Please enter a valid email address."),
  studentId: z.string().trim().length(9, "Student ID must be exactly 9 characters."),
  phone:     z.string().refine(
    (val) => val.replace(/\D/g, "").length >= 10,
    "Phone number must have at least 10 digits."
  ),
});

type ProfileForm = z.infer<typeof profileSchema>;

const Profile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null); // Week 11: profile photo

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      studentId: "",
      phone: "",
    },
    mode: "onSubmit",
  });

  // Track field values to enable/disable the Save button
  const watchedValues = watch();
  const isFormFilled = Object.values(watchedValues).every((v) => v.length > 0);

  // Load saved profile data and photo on mount
  useEffect(() => {
    const loadProfile = async () => {
      const saved = await storage.get<ProfileForm>(STORAGE_KEYS.PROFILE);
      if (saved !== null) {
        reset(saved);
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
    };
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

  // ── RHF submit + cancel ───────────────────────────────────

  // RHF calls this only after Zod validation passes
  const onSubmit = async (data: ProfileForm) => {
    await storage.set(STORAGE_KEYS.PROFILE, data);
    setHasSavedData(true);
    setIsEditing(false);
  };

  const handleCancel = async () => {
    const saved = await storage.get<ProfileForm>(STORAGE_KEYS.PROFILE);
    if (saved !== null) {
      reset(saved);
    }
    setIsEditing(false);
  };

  // ── Week 11: Avatar (shown in both view and edit mode) ──────

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
    const values = watch();
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.h1}>My Profile</Text>

        {renderAvatar() /* Week 11 */}

        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>First Name</Text>
            <Text style={styles.profileValue}>{values.firstName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Last Name</Text>
            <Text style={styles.profileValue}>{values.lastName}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Email</Text>
            <Text style={styles.profileValue}>{values.email}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Student ID</Text>
            <Text style={styles.profileValue}>{values.studentId}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Phone Number</Text>
            <Text style={styles.profileValue}>{values.phone}</Text>
          </View>
        </View>

        <Pressable style={styles.button} onPress={() => setIsEditing(true)}>
          <Text style={styles.buttonText}>Edit Profile</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── EDIT MODE — React Hook Form + Zod validation ──────────

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Edit Profile</Text>

      {renderAvatar() /* Week 11 */}

      {/* First Name */}
      <Text style={styles.label}>First Name</Text>
      <Controller
        control={control}
        name="firstName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            placeholder="e.g. Jane"
            placeholderTextColor={theme.colors.muted}
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
          />
        )}
      />
      {errors.firstName && (
        <Text style={styles.error}>{errors.firstName.message}</Text>
      )}

      {/* Last Name */}
      <Text style={styles.label}>Last Name</Text>
      <Controller
        control={control}
        name="lastName"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            placeholder="e.g. Smith"
            placeholderTextColor={theme.colors.muted}
            value={value}
            onChangeText={onChange}
            autoCapitalize="words"
          />
        )}
      />
      {errors.lastName && (
        <Text style={styles.error}>{errors.lastName.message}</Text>
      )}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="e.g. jane.smith@edu.ca"
            placeholderTextColor={theme.colors.muted}
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {errors.email && (
        <Text style={styles.error}>{errors.email.message}</Text>
      )}

      {/* Student ID */}
      <Text style={styles.label}>Student ID</Text>
      <Controller
        control={control}
        name="studentId"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.studentId && styles.inputError]}
            placeholder="e.g. A00123456"
            placeholderTextColor={theme.colors.muted}
            value={value}
            onChangeText={onChange}
            autoCapitalize="characters"
            maxLength={9}
          />
        )}
      />
      {errors.studentId && (
        <Text style={styles.error}>{errors.studentId.message}</Text>
      )}

      {/* Phone Number */}
      <Text style={styles.label}>Phone Number</Text>
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            placeholder="e.g. (403) 555-0123"
            placeholderTextColor={theme.colors.muted}
            value={value}
            onChangeText={onChange}
            keyboardType="phone-pad"
          />
        )}
      />
      {errors.phone && (
        <Text style={styles.error}>{errors.phone.message}</Text>
      )}

      {/* Buttons */}
      {hasSavedData ? (
        <View style={styles.buttonRow}>
          <Pressable style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, !isFormFilled && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isFormFilled}
          >
            <Text style={styles.buttonText}>Save Profile</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.button, !isFormFilled && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
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

  // ── View mode styles ──────────────────────────────────────
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

  // ── Edit mode styles ──────────────────────────────────────
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

  // ── Button styles ─────────────────────────────────────────
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
