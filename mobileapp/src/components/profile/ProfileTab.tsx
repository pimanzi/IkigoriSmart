import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { UserProfile, District } from '../../types/profileTypes';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileInput } from './ProfileInput';
import { PasswordInput } from './PasswordInput';
import { DistrictPicker } from './DistrictPicker';
import { useUpdateProfile } from '../../hooks/useUpdateProfile';
import { useUpdatePassword } from '../../hooks/useUpdatePassword';
import { useCurrentUser } from '../../hooks/useCurrentUser';

interface ProfileTabProps {
  userProfile: UserProfile;
  onLogout: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ userProfile, onLogout }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: user } = useCurrentUser();

  const [firstName, setFirstName] = useState(user?.profile?.first_name || '');
  const [lastName, setLastName] = useState(user?.profile?.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(
    user?.profile?.phone_number != null ? String(user.profile.phone_number) : ''
  );
  const [district, setDistrict] = useState<District>(
    (user?.profile?.district as District) || 'Musanze'
  );
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  const { updateProfile, isPending: profilePending } = useUpdateProfile();
  const { updatePassword, isPending: passwordPending } = useUpdatePassword();

  const origFirstName = user?.profile?.first_name || '';
  const origLastName  = user?.profile?.last_name  || '';
  const origPhone     = user?.profile?.phone_number != null ? String(user.profile.phone_number) : '';
  const origDistrict  = (user?.profile?.district as District) || 'Musanze';

  const hasChanges =
    firstName   !== origFirstName ||
    lastName    !== origLastName  ||
    phoneNumber !== origPhone     ||
    district    !== origDistrict;

  const validateProfileForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('profile.firstNameRequired');
    }
    if (!lastName.trim()) {
      newErrors.lastName = t('profile.lastNameRequired');
    }
    if (!phoneNumber.trim() || !/^07\d{8}$/.test(phoneNumber)) {
      newErrors.phoneNumber = t('profile.phoneInvalid');
    }
    if (!district || !(['Musanze', 'Nyabihu'] as District[]).includes(district)) {
      newErrors.district = t('profile.districtRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    if (newPassword.length < 8) {
      newErrors.newPassword = t('profile.passwordTooShort');
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('profile.passwordMismatch');
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (!validateProfileForm() || !user?.profile?.id) return;

    updateProfile({
      profileId: user.profile.id,
      payload: {
        first_name:   firstName,
        last_name:    lastName,
        phone_number: Number(phoneNumber),
        district,
      },
    });
  };

  const handleSavePassword = () => {
    if (!validatePasswordForm()) return;

    updatePassword(newPassword, {
      onSuccess: () => {
        setNewPassword('');
        setConfirmPassword('');
      },
    });
  };

  const passwordButtonActive = newPassword.length > 0 && confirmPassword.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ProfileAvatar
          firstName={firstName}
          lastName={lastName}
          email={userProfile.email}
          avatarUrl={userProfile.avatarUrl}
        />

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('profile.personalInfo')}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.iconsMuted }]} />

          <ProfileInput
            label={t('profile.firstName')}
            value={firstName}
            onChangeText={setFirstName}
            icon="person-outline"
            placeholder={t('profile.firstNamePlaceholder')}
            error={errors.firstName}
          />

          <ProfileInput
            label={t('profile.lastName')}
            value={lastName}
            onChangeText={setLastName}
            icon="person-outline"
            placeholder={t('profile.lastNamePlaceholder')}
            error={errors.lastName}
          />

          <ProfileInput
            label={t('profile.email')}
            value={userProfile.email}
            onChangeText={() => {}}
            icon="mail-outline"
            editable={false}
            rightIcon="lock-closed-outline"
            note={t('profile.emailNote')}
          />

          <ProfileInput
            label={t('profile.phoneNumber')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            icon="call-outline"
            placeholder={t('profile.phoneNumberPlaceholder')}
            keyboardType="phone-pad"
            error={errors.phoneNumber}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('profile.location')}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.iconsMuted }]} />

          <DistrictPicker
            selectedDistrict={district}
            onSelectDistrict={setDistrict}
          />
          {errors.district ? (
            <Text style={[styles.errorText, { color: theme.colors.errorMain }]}>
              {errors.district}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: hasChanges
                ? theme.colors.brandMain
                : theme.colors.surfaceHover,
            },
          ]}
          onPress={handleSaveProfile}
          disabled={!hasChanges || profilePending}
          activeOpacity={0.7}
        >
          {profilePending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name="save-outline"
                size={20}
                color={hasChanges ? '#ffffff' : theme.colors.iconsMuted}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  { color: hasChanges ? '#ffffff' : theme.colors.iconsMuted },
                ]}
              >
                {t('profile.saveChanges')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('profile.security')}
          </Text>
          <View style={[styles.divider, { backgroundColor: theme.colors.iconsMuted }]} />

          <PasswordInput
            label={t('profile.password')}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t('profile.passwordPlaceholder')}
            error={errors.newPassword}
          />

          <PasswordInput
            label={t('profile.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t('profile.confirmPasswordPlaceholder')}
            error={errors.confirmPassword}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: passwordButtonActive
                ? theme.colors.brandMain
                : theme.colors.surfaceHover,
            },
          ]}
          onPress={handleSavePassword}
          disabled={!passwordButtonActive || passwordPending}
          activeOpacity={0.7}
        >
          {passwordPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordButtonActive ? '#ffffff' : theme.colors.iconsMuted}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  { color: passwordButtonActive ? '#ffffff' : theme.colors.iconsMuted },
                ]}
              >
                {t('profile.saveChanges')}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, { borderColor: theme.colors.brandMain }]}
          onPress={onLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.colors.brandMain} />
          <Text style={[styles.logoutButtonText, { color: theme.colors.brandMain }]}>
            {t('profile.logOut')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
