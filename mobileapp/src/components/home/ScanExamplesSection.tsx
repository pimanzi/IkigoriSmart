import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { ScanCarousel } from './ScanCarousel';

export const ScanExamplesSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {t('diagnosticStandards.title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('diagnosticStandards.subtitle')}
        </Text>
      </View>
      <ScanCarousel />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
});
