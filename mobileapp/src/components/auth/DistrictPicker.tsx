import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface DistrictPickerProps {
  label: string;
  placeholder: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  error?: string;
}

export const DistrictPicker: React.FC<DistrictPickerProps> = ({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  error,
}) => {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const borderColor = error ? theme.colors.errorMain : theme.colors.iconsMuted;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label}
      </Text>
      <TouchableOpacity
        style={[
          styles.picker,
          {
            backgroundColor: theme.colors.surfaceHover,
            borderColor,
          },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.pickerText,
            {
              color: selectedOption
                ? theme.colors.textPrimary
                : theme.colors.textSecondary,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.iconsSecondary}
        />
      </TouchableOpacity>
      {error && (
        <Text style={[styles.error, { color: theme.colors.errorMain }]}>
          {error}
        </Text>
      )}

      {/* Modal Picker */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surfaceMain },
            ]}
          >
            <Text
              style={[styles.modalTitle, { color: theme.colors.textPrimary }]}
            >
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    value === item.value && {
                      backgroundColor: theme.colors.brandHover,
                    },
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: theme.colors.textPrimary },
                      value === item.value && {
                        color: theme.colors.brandMain,
                        fontWeight: typography.fontWeight.semibold,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.brandMain}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  picker: {
    height: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerText: {
    fontSize: typography.fontSize.md,
  },
  error: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxHeight: 300,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  optionText: {
    fontSize: typography.fontSize.md,
  },
});
