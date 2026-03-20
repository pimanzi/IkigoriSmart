import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface ShutterButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

const ShutterButton: React.FC<ShutterButtonProps> = ({ onPress, disabled }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={styles.touchable}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={[styles.outer, { borderColor: theme.colors.brandHover }]}>
        <View
          style={[styles.inner, { backgroundColor: theme.colors.brandMain }]}
        >
          <Ionicons name="camera" size={28} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#e6f6f1', // theme.colors.brandHover
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  inner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#04966a', // theme.colors.brandMain
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ShutterButton;
