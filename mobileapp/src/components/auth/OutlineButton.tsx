import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface OutlineButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}

export const OutlineButton: React.FC<OutlineButtonProps> = ({
  title,
  onPress,
  disabled = false,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          borderColor: theme.colors.brandMain,
          backgroundColor: 'transparent',
        },
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: theme.colors.brandMain }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  disabled: {
    opacity: 0.6,
  },
});
