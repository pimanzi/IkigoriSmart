import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
}) => {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>{label}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.surfaceMain,
            borderColor: error ? theme.colors.errorMain : theme.colors.iconsMuted,
          },
        ]}
      >
        <Ionicons name="lock-closed-outline" size={20} color={theme.colors.iconsSecondary} />
        <TextInput
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.iconsMuted}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.7}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={theme.colors.iconsSecondary}
          />
        </TouchableOpacity>
      </View>
      {error && <Text style={[styles.error, { color: theme.colors.errorMain }]}>{error}</Text>}
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
});
