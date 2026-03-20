import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Logo Icon */}
      <View
        style={[styles.logoCircle, { backgroundColor: theme.colors.brandMain }]}
      >
        <Ionicons name="leaf" size={28} color="#ffffff" />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {title}
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {subtitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
