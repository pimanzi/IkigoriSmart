import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { useUpdateAvatar } from '../../hooks/useUpdateAvatar';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  firstName,
  lastName,
  email,
  avatarUrl,
}) => {
  const { theme } = useTheme();
  const { data: user } = useCurrentUser();
  const { updateAvatar: doUpdateAvatar, isPending: avatarPending } = useUpdateAvatar();
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Holds the local device URI immediately after the user picks an image.
  // This makes the new photo appear instantly without waiting for the upload.
  const [localUri, setLocalUri] = useState<string | undefined>(undefined);

  // Falls back to initials when the server URL fails to load (e.g. bucket not public).
  const [serverLoadFailed, setServerLoadFailed] = useState(false);

  const handleEditPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && user?.id && user?.profile?.id) {
      const uri = result.assets[0].uri;
      // Show the picked image right away — do not wait for upload to finish
      setLocalUri(uri);
      setServerLoadFailed(false);
      doUpdateAvatar({
        input: { imageUri: uri, authId: user.id },
        profileId: user.profile.id,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        {localUri ? (
          // Local device image — shows instantly after picking
          <Image source={{ uri: localUri }} style={styles.avatar} />
        ) : avatarUrl && !serverLoadFailed ? (
          // Server image from profile — with error fallback
          <Image
            source={{ uri: avatarUrl }}
            style={styles.avatar}
            onError={() => setServerLoadFailed(true)}
          />
        ) : (
          // Initials fallback (no image, or server URL failed to load)
          <View style={[styles.avatar, { backgroundColor: theme.colors.brandMain }]}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}

        {avatarPending && (
          <View style={styles.avatarOverlay}>
            <ActivityIndicator size="small" color="#ffffff" />
          </View>
        )}

        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: '#ffffff' }]}
          onPress={handleEditPress}
          disabled={avatarPending}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={16} color={theme.colors.brandMain} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.name, { color: theme.colors.textPrimary }]}>
        {firstName} {lastName}
      </Text>
      <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
  },
});
