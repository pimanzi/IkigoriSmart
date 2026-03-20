import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { VoiceCommand, StatusMessage } from '../../hooks/useVoiceCommands';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.65;

interface VoiceModeOverlayProps {
  visible: boolean;
  isListening: boolean;
  statusMessage: StatusMessage;
  availableCommands: VoiceCommand[];
  onClose: () => void;
}

// Builds the display list: collapses 'one' and 'second' into a single region placeholder
type DisplayItem = VoiceCommand | 'REGION';

function buildDisplayList(commands: VoiceCommand[]): DisplayItem[] {
  const out: DisplayItem[] = [];
  for (const cmd of commands) {
    if (cmd.keyword === 'one') {
      out.push('REGION');
    } else if (cmd.keyword === 'second') {
      // skipped — rendered inside the REGION card
    } else {
      out.push(cmd);
    }
  }
  return out;
}

export const VoiceModeOverlay: React.FC<VoiceModeOverlayProps> = ({
  visible,
  isListening,
  statusMessage,
  availableCommands,
  onClose,
}) => {
  const { theme } = useTheme();
  const slideAnim    = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const micPulse     = useRef(new Animated.Value(1)).current;
  const micOpacity   = useRef(new Animated.Value(1)).current;
  const micLoopRef   = useRef<Animated.CompositeAnimation | null>(null);
  const [modalMounted, setModalMounted] = useState(false);

  // Slide-up / slide-down animation
  useEffect(() => {
    if (visible) {
      setModalMounted(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 52,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 230,
        useNativeDriver: true,
      }).start(() => setModalMounted(false));
    }
  }, [visible]);

  // Pulsing mic icon while listening — stop pulse when command recognised
  useEffect(() => {
    if (isListening && statusMessage.type !== 'recognized') {
      micLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(micPulse,   { toValue: 1.22, duration: 580, useNativeDriver: true }),
            Animated.timing(micOpacity, { toValue: 0.45, duration: 580, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(micPulse,   { toValue: 1,  duration: 580, useNativeDriver: true }),
            Animated.timing(micOpacity, { toValue: 1,  duration: 580, useNativeDriver: true }),
          ]),
        ]),
      );
      micLoopRef.current.start();
    } else {
      micLoopRef.current?.stop();
      micPulse.setValue(1);
      micOpacity.setValue(1);
    }
  }, [isListening, statusMessage.type]);

  const getStatusColor = () => {
    switch (statusMessage.type) {
      case 'recognized': return theme.colors.successMain;
      case 'error':      return theme.colors.errorMain;
      case 'disabled':   return theme.colors.iconsMuted;
      default:           return theme.colors.textSecondary;
    }
  };

  if (!modalMounted) return null;

  const oneCmd = availableCommands.find(c => c.keyword === 'one');
  const secondCmd = availableCommands.find(c => c.keyword === 'second');
  const displayList = buildDisplayList(availableCommands);

  return (
    <Modal
      transparent
      visible={modalMounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFillObject}>
        {/* Backdrop */}
        <TouchableOpacity
          style={[StyleSheet.absoluteFillObject, styles.backdrop]}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surfaceMain,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.colors.surfaceHover }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Animated.View style={{ transform: [{ scale: micPulse }], opacity: micOpacity }}>
              <View
                style={[
                  styles.micCircle,
                  {
                    backgroundColor:
                      statusMessage.type === 'recognized'
                        ? theme.colors.successHover ?? theme.colors.brandHover
                        : isListening
                        ? theme.colors.brandHover
                        : theme.colors.surfaceHover,
                  },
                ]}
              >
                <Ionicons
                  name={
                    statusMessage.type === 'recognized'
                      ? 'checkmark-circle'
                      : isListening
                      ? 'mic'
                      : 'mic-off-outline'
                  }
                  size={28}
                  color={
                    statusMessage.type === 'recognized'
                      ? theme.colors.successMain
                      : isListening
                      ? theme.colors.brandMain
                      : theme.colors.iconsMuted
                  }
                />
              </View>
            </Animated.View>

            <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
              {statusMessage.type === 'recognized'
                ? 'Got it!'
                : isListening
                ? 'Listening...'
                : 'Voice Mode'}
            </Text>

            {/* Status row: icon + text */}
            <View style={styles.statusRow}>
              {statusMessage.type === 'recognized' && (
                <Ionicons name="checkmark-circle" size={13} color={theme.colors.successMain} />
              )}
              {(statusMessage.type === 'error') && (
                <Ionicons name="close-circle" size={13} color={theme.colors.errorMain} />
              )}
              {statusMessage.type === 'disabled' && (
                <Ionicons name="alert-circle" size={13} color={theme.colors.iconsMuted} />
              )}
              <Text style={[styles.headerSubtitle, { color: getStatusColor() }]}>
                {statusMessage.text}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.surfaceHover }]} />

          {/* Command list */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.commandList}
            showsVerticalScrollIndicator={false}
          >
            {displayList.map((item, index) => {
              const isLast = index === displayList.length - 1;

              if (item === 'REGION') {
                const regionEnabled = oneCmd?.enabled || secondCmd?.enabled;
                return (
                  <View key="region">
                    <View
                      style={[
                        styles.regionCard,
                        { backgroundColor: theme.colors.surfaceHover },
                        !regionEnabled && styles.rowDisabled,
                      ]}
                    >
                      {/* Region header */}
                      <View style={styles.regionHeader}>
                        <Ionicons
                          name="map-outline"
                          size={14}
                          color={regionEnabled ? theme.colors.textSecondary : theme.colors.iconsMuted}
                        />
                        <Text
                          style={[
                            styles.regionTitle,
                            { color: regionEnabled ? theme.colors.textSecondary : theme.colors.iconsMuted },
                          ]}
                        >
                          Choose your region
                        </Text>
                        {!regionEnabled && (
                          <Ionicons name="lock-closed-outline" size={12} color={theme.colors.iconsMuted} />
                        )}
                      </View>

                      {/* Region options side by side */}
                      <View style={styles.regionOptions}>
                        {oneCmd && (
                          <View
                            style={[
                              styles.regionOption,
                              { backgroundColor: theme.colors.surfaceMain },
                              !oneCmd.enabled && styles.optionDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.regionKeyword,
                                { color: oneCmd.enabled ? theme.colors.brandMain : theme.colors.iconsMuted },
                              ]}
                            >
                              "one"
                            </Text>
                            <Text
                              style={[
                                styles.regionName,
                                { color: oneCmd.enabled ? theme.colors.textPrimary : theme.colors.iconsMuted },
                              ]}
                            >
                              Musanze
                            </Text>
                          </View>
                        )}
                        {secondCmd && (
                          <View
                            style={[
                              styles.regionOption,
                              { backgroundColor: theme.colors.surfaceMain },
                              !secondCmd.enabled && styles.optionDisabled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.regionKeyword,
                                { color: secondCmd.enabled ? theme.colors.brandMain : theme.colors.iconsMuted },
                              ]}
                            >
                              "second"
                            </Text>
                            <Text
                              style={[
                                styles.regionName,
                                { color: secondCmd.enabled ? theme.colors.textPrimary : theme.colors.iconsMuted },
                              ]}
                            >
                              Nyabihu
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {!isLast && <View style={styles.gap} />}
                  </View>
                );
              }

              // Regular command row
              const cmd = item as VoiceCommand;
              return (
                <View key={cmd.keyword}>
                  <View
                    style={[
                      styles.commandRow,
                      { backgroundColor: theme.colors.surfaceHover },
                      !cmd.enabled && styles.rowDisabled,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor: cmd.enabled
                            ? theme.colors.brandHover
                            : theme.colors.surfaceMain,
                        },
                      ]}
                    >
                      <Ionicons
                        name={cmd.icon as any}
                        size={18}
                        color={cmd.enabled ? theme.colors.brandMain : theme.colors.iconsMuted}
                      />
                    </View>

                    <View style={styles.textGroup}>
                      <Text
                        style={[
                          styles.keyword,
                          { color: cmd.enabled ? theme.colors.brandMain : theme.colors.iconsMuted },
                        ]}
                      >
                        "{cmd.keyword}"
                      </Text>
                      <Text
                        style={[
                          styles.desc,
                          { color: cmd.enabled ? theme.colors.textSecondary : theme.colors.iconsMuted },
                        ]}
                      >
                        {cmd.description}
                      </Text>
                    </View>

                    {!cmd.enabled && (
                      <Ionicons name="lock-closed-outline" size={13} color={theme.colors.iconsMuted} />
                    )}
                  </View>
                  {!isLast && <View style={styles.gap} />}
                </View>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.colors.surfaceHover }]}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Voice mode closes automatically after 10 seconds
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 20,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 2,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 6,
  },
  micCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  scroll: {
    flex: 1,
  },
  commandList: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  gap: {
    height: 8,
  },
  // Regular command row
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    gap: 12,
  },
  rowDisabled: {
    opacity: 0.45,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  keyword: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 13,
    lineHeight: 17,
  },
  // Region card
  regionCard: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  regionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  regionOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  regionOption: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  optionDisabled: {
    opacity: 0.45,
  },
  regionKeyword: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  regionName: {
    fontSize: 12,
    fontWeight: '500',
  },
  // Footer
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 16,
  },
});
