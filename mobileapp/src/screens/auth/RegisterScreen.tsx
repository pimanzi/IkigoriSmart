import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthInput } from '../../components/auth/AuthInput';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { DistrictPicker } from '../../components/auth/DistrictPicker';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { useRegister } from '../../hooks/useRegister';
import { District } from '../../types/auth.types';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  district: string;
  phoneNumber: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  district?: string;
  phoneNumber?: string;
}

const DISTRICT_OPTIONS = [
  { label: 'Nyabihu', value: 'Nyabihu' },
  { label: 'Musanze', value: 'Musanze' },
];

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { mutate: register, isPending } = useRegister();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: '',
    phoneNumber: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateField = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    // Rwandan phone number: starts with 07, 10 digits total
    const phoneRegex = /^07[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('auth.errors.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('auth.errors.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 8) {
      newErrors.password = t('auth.errors.passwordMinLength8');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch');
    }

    if (!formData.district) {
      newErrors.district = t('auth.errors.districtRequired');
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('auth.errors.phoneRequired');
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = t('auth.errors.phoneInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validateForm()) return;

    register(
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phoneNumber: formData.phoneNumber,
        district: formData.district as District,
      },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: t('auth.toast.registerSuccess'),
          });
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: t('auth.toast.registerError'),
          });
        },
      }
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={theme.colors.textPrimary}
            />
          </TouchableOpacity>

          {/* Header */}
          <AuthHeader
            title={t('auth.register')}
            subtitle={t('auth.registerSubtitle')}
          />

          {/* Form */}
          <View style={styles.form}>
            <AuthInput
              label={t('auth.firstName')}
              placeholder={t('auth.firstNamePlaceholder')}
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              error={errors.firstName}
              autoCapitalize="words"
            />

            <AuthInput
              label={t('auth.lastName')}
              placeholder={t('auth.lastNamePlaceholder')}
              value={formData.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              error={errors.lastName}
              autoCapitalize="words"
            />

            <AuthInput
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={formData.password}
              onChangeText={(text) => updateField('password', text)}
              error={errors.password}
            />

            <PasswordInput
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChangeText={(text) => updateField('confirmPassword', text)}
              error={errors.confirmPassword}
            />

            <DistrictPicker
              label={t('auth.district')}
              placeholder={t('auth.districtPlaceholder')}
              value={formData.district}
              onValueChange={(value) => updateField('district', value)}
              options={DISTRICT_OPTIONS}
              error={errors.district}
            />

            <AuthInput
              label={t('auth.phoneNumber')}
              placeholder={t('auth.phoneNumberPlaceholder')}
              value={formData.phoneNumber}
              onChangeText={(text) => updateField('phoneNumber', text)}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
            />

            {/* Terms & Privacy */}
            <Text style={[styles.terms, { color: theme.colors.textSecondary }]}>
              {t('auth.termsText')}
            </Text>

            {/* Register Button */}
            <PrimaryButton
              title={t('auth.register')}
              onPress={handleRegister}
              loading={isPending}
              disabled={isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  form: {
    flex: 1,
  },
  terms: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: 18,
  },
});
