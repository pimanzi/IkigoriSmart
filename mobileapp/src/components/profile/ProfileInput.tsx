import React from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface ProfileInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  note?: string;
}

export const ProfileInput: React.FC<ProfileInputProps> = ({
  label,
  value,
  onChangeText,
  icon,
  placeholder,
  editable = true,
  keyboardType = 'default',
  error,
  rightIcon,
  note,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: editable ? theme.colors.surfaceMain : theme.colors.surfaceHover,
            borderColor: error ? theme.colors.errorMain : theme.colors.iconsMuted,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={theme.colors.iconsSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.iconsMuted}
          editable={editable}
          keyboardType={keyboardType}
        />
        {rightIcon && <Ionicons name={rightIcon} size={16} color={theme.colors.iconsMuted} />}
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.errorMain }]}>{error}</Text>}
      {note && <Text style={[styles.note, { color: theme.colors.iconsMuted }]}>{note}</Text>}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  note: {
    fontSize: 11,
    marginTop: 4,
  },
});
