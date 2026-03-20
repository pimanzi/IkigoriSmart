import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

interface BottomCTAProps {
  isLoggedIn?: boolean;
  onSignIn?: () => void;
  onSignUp?: () => void;
  onDashboard?: () => void;
}

export const BottomCTA: React.FC<BottomCTAProps> = ({
  isLoggedIn = false,
  onSignIn,
  onSignUp,
  onDashboard,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  if (isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
        <TouchableOpacity style={styles.dashboardBtn} onPress={onDashboard} activeOpacity={0.8}>
          <Ionicons name="grid-outline" size={20} color="#ffffff" />
          <Text style={styles.dashText}>{t('bottomCTA.loggedIn.dashboard')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {t('bottomCTA.notLoggedIn.title')}
      </Text>
      <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
        {t('bottomCTA.notLoggedIn.description')}
      </Text>
      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.signInBtn, { borderColor: theme.colors.brandMain }]}
          onPress={onSignIn}
          activeOpacity={0.8}
        >
          <Text style={[styles.signInText, { color: theme.colors.brandMain }]}>
            {t('bottomCTA.notLoggedIn.signIn')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signUpBtn} onPress={onSignUp} activeOpacity={0.8}>
          <Text style={styles.signUpText}>{t('bottomCTA.notLoggedIn.signUp')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  dashboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#04966a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
  },
  dashText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
