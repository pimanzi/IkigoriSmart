import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { useLogin } from '../../hooks/useLogin';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';

type Props = StackScreenProps<AuthStackParamList, 'Login'>;

interface FormErrors {
  email?: string;
  password?: string;
}

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { mutate: login, isPending } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = t('auth.errors.emailRequired');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.errors.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validateForm()) return;
    login(
      { email, password },
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: t('auth.toast.loginSuccess'),
          });
        },
        onError: (error) => {
          const message = error.message;
          let toastKey = 'auth.toast.loginError';

          if (message.includes('email not confirmed')) {
            toastKey = 'auth.toast.emailNotConfirmed';
          } else if (message.includes('Incorrect email or password')) {
            toastKey = 'auth.toast.invalidCredentials';
          } else if (message.includes('Account setup incomplete')) {
            toastKey = 'auth.toast.accountIncomplete';
          }

          Toast.show({
            type: 'error',
            text1: t(toastKey),
          });
        },
      }
    );
  };

  const handleForgotPassword = () => {
    Alert.alert('Password Reset', 'Password reset coming soon.');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
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
            title={t('auth.login')}
            subtitle={t('auth.loginSubtitle')}
          />

          {/* Form */}
          <View style={styles.form}>
            <AuthInput
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <PasswordInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.forgotPasswordText,
                  { color: theme.colors.brandMain },
                ]}
              >
                {t('auth.forgotPassword')}
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <PrimaryButton
              title={t('auth.login')}
              onPress={handleLogin}
              loading={isPending}
              disabled={isPending}
            />

            {/* Register Link */}
            <View style={styles.registerContainer}>
              <Text
                style={[
                  styles.registerText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('auth.noAccount')}{' '}
              </Text>
              <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
                <Text
                  style={[
                    styles.registerLink,
                    { color: theme.colors.brandMain },
                  ]}
                >
                  {t('auth.register')}
                </Text>
              </TouchableOpacity>
            </View>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    fontSize: typography.fontSize.sm,
  },
  registerLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
});
