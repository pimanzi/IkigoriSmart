import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface AlertEmptyStateProps {
  variant: 'no-unread' | 'no-match';
  onClearFilter?: () => void;
}

export const AlertEmptyState: React.FC<AlertEmptyStateProps> = ({ variant, onClearFilter }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const isNoUnread = variant === 'no-unread';

  return (
    <View style={styles.container}>
      <View style={[
        styles.iconCircle,
        { backgroundColor: isNoUnread ? theme.colors.brandMain + '15' : theme.colors.surfaceHover },
      ]}>
        <Ionicons
          name={isNoUnread ? 'checkmark-done-circle' : 'notifications-off'}
          size={40}
          color={isNoUnread ? theme.colors.brandMain : theme.colors.iconsMuted}
        />
      </View>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {isNoUnread ? t('alerts.noUnreadAlerts') : t('alerts.noAlertsFound')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {isNoUnread ? t('alerts.noUnreadAlertsDesc') : t('alerts.noAlertsDescription')}
      </Text>
      {!isNoUnread && onClearFilter && (
        <TouchableOpacity
          style={[styles.clearBtn, { backgroundColor: theme.colors.brandHover }]}
          onPress={onClearFilter}
          activeOpacity={0.7}
        >
          <Text style={[styles.clearBtnText, { color: theme.colors.brandMain }]}>
            {t('alerts.clearFilter')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 3,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
  },
  clearBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
