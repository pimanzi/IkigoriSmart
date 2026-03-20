import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surfaceMain,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    text: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.textPrimary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('navigation.profile')} Screen</Text>
    </View>
  );
};
