import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface VoiceFABProps {
  isListening: boolean;
  onPress: () => void;
  bottomOffset?: number;
}

export const VoiceFAB: React.FC<VoiceFABProps> = ({ isListening, onPress, bottomOffset = 0 }) => {
  const { theme } = useTheme();
  const pulseScale   = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isListening) {
      pulseOpacity.setValue(0.55);
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(pulseScale,   { toValue: 1.7, duration: 900, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0,   duration: 900, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(pulseScale,   { toValue: 1,    duration: 0, useNativeDriver: true }),
            Animated.timing(pulseOpacity, { toValue: 0.55, duration: 0, useNativeDriver: true }),
          ]),
        ]),
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      Animated.parallel([
        Animated.timing(pulseScale,   { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [isListening]);

  return (
    <View style={[styles.wrapper, { bottom: bottomOffset }]} pointerEvents="box-none">
      <View style={styles.center}>
        <View style={styles.fabWrap}>
          {/* Animated pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: theme.colors.brandMain,
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: isListening
                  ? theme.colors.errorMain
                  : theme.colors.brandMain,
                shadowColor: isListening
                  ? theme.colors.errorMain
                  : theme.colors.brandMain,
              },
            ]}
            onPress={onPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isListening ? 'radio-outline' : 'mic'}
              size={28}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          Voice Mode
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 18,
  },
  center: {
    alignItems: 'center',
  },
  fabWrap: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 8,
    elevation: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
