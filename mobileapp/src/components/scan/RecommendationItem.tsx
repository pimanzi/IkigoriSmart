import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface RecommendationItemProps {
  number: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color?: string;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  number,
  icon,
  title,
  description,
  color,
}) => {
  const { theme } = useTheme();
  const accentColor = color ?? theme.colors.brandMain;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.brandHover }]}>
      <View style={[styles.numberCircle, { backgroundColor: accentColor }]}>
        <Text style={styles.numberText}>{number}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name={icon} size={22} color={accentColor} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default RecommendationItem;
