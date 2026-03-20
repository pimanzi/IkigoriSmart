import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface PasswordInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? theme.colors.errorMain
    : isFocused
      ? theme.colors.brandMain
      : theme.colors.iconsMuted;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surfaceHover,
            borderColor,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color={theme.colors.iconsSecondary}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.colors.errorMain }]}>
          {error}
        </Text>
      )}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  error: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});
