import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { RiskLevel } from '../../screens/alerts/AlertsScreen';

interface AlertFilterBarProps {
  activeFilter: RiskLevel | 'all';
  onFilterChange: (filter: RiskLevel | 'all') => void;
  counts: { all: number; High: number; Medium: number; Low: number };
}

type CountKey = 'all' | RiskLevel;

interface FilterOption {
  key: CountKey;
  label: string;
}

export const AlertFilterBar: React.FC<AlertFilterBarProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const filters: FilterOption[] = [
    { key: 'all',    label: t('alerts.filterAll')    },
    { key: 'High',   label: t('alerts.filterHigh')   },
    { key: 'Medium', label: t('alerts.filterMedium') },
    { key: 'Low',    label: t('alerts.filterLow')    },
  ];

  return (
    <View style={styles.wrapper}>
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts[filter.key as CountKey] ?? 0;

        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.pill,
              {
                backgroundColor: isActive
                  ? theme.colors.brandMain
                  : theme.colors.surfaceHover,
                borderColor: isActive
                  ? theme.colors.brandMain
                  : theme.colors.iconsMuted,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.label,
                { color: isActive ? '#ffffff' : theme.colors.textSecondary },
              ]}
              numberOfLines={1}
            >
              {filter.label} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',           // wraps to next line if needed instead of scrolling
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  pill: {
    flexShrink: 1,              // prevents pill from overflowing its container
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,         // fixed vertical padding so height never jumps
    minHeight: 36,              // guarantees stable height across active/inactive
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,             // explicit line height prevents text clipping
    includeFontPadding: false,  // Android: removes extra space that clips text
  },
});