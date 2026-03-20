import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { District } from '../../types/profileTypes';

interface DistrictPickerProps {
  selectedDistrict: District;
  onSelectDistrict: (district: District) => void;
}

export const DistrictPicker: React.FC<DistrictPickerProps> = ({
  selectedDistrict,
  onSelectDistrict,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const districts: District[] = ['Nyabihu', 'Musanze'];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {t('profile.district')}
      </Text>
      <View style={styles.row}>
        {districts.map((district) => {
          const isSelected = selectedDistrict === district;
          return (
            <TouchableOpacity
              key={district}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected
                    ? theme.colors.brandHover
                    : theme.colors.surfaceHover,
                  borderColor: isSelected ? theme.colors.brandMain : 'transparent',
                },
              ]}
              onPress={() => onSelectDistrict(district)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="location"
                size={24}
                color={isSelected ? theme.colors.brandMain : theme.colors.iconsMuted}
              />
              <Text
                style={[
                  styles.districtText,
                  {
                    color: isSelected ? theme.colors.brandMain : theme.colors.textSecondary,
                  },
                ]}
              >
                {district}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    gap: spacing.xs,
  },
  districtText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
