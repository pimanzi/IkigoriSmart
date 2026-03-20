import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';

interface TipsOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const TipsOverlay: React.FC<TipsOverlayProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const tips = [
    { icon: 'checkmark-circle' as const, text: t('scan.tip1') },
    { icon: 'checkmark-circle' as const, text: t('scan.tip2') },
    { icon: 'checkmark-circle' as const, text: t('scan.tip3') },
  ];

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlayBg}>
        <View
          style={[styles.sheet, { backgroundColor: theme.colors.surfaceMain }]}
        >
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {t('scan.tipsTitle')}
          </Text>
          {tips.map((tip, idx) => (
            <View key={idx} style={styles.tipRow}>
              <Ionicons
                name={tip.icon}
                size={22}
                color={theme.colors.successMain}
              />
              <Text
                style={[styles.tipText, { color: theme.colors.textSecondary }]}
              >
                {tip.text}
              </Text>
            </View>
          ))}
          <TouchableOpacity
            style={[
              styles.closeBtn,
              { backgroundColor: theme.colors.brandMain },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeText}>{t('scan.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    padding: spacing.lg,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    minHeight: 220,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tipText: {
    fontSize: 15,
  },
  closeBtn: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default TipsOverlay;
