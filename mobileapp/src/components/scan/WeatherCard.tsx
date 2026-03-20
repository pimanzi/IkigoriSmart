import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface WeatherCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ icon, label, value }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceHover }]}>
      <Ionicons name={icon} size={28} color={theme.colors.brandMain} />
      <Text style={[styles.value, { color: theme.colors.textPrimary }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  label: {
    fontSize: 13,
    marginTop: spacing.xs,
  },
});

export default WeatherCard;
