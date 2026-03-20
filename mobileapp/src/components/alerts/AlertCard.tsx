import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { AlertRecord } from '../../types';
import { getRelativeTime } from '../../screens/alerts/AlertsScreen';

type AlertRiskLevel = 'Low' | 'Medium' | 'High';

interface AlertCardProps {
  alert: AlertRecord;
  onMarkAsRead: (id: string) => void;
}

const getRiskConfig = (riskLevel: AlertRiskLevel, theme: any) => {
  switch (riskLevel) {
    case 'High':
      return {
        borderColor: theme.colors.errorMain,
        backgroundColor: theme.colors.errorHover,
        textColor: theme.colors.errorMain,
        icon: 'warning' as const,
      };
    case 'Medium':
      return {
        borderColor: theme.colors.chart4,
        backgroundColor: theme.colors.chart4 + '20',
        textColor: theme.colors.chart4,
        icon: 'alert-circle' as const,
      };
    default:
      return {
        borderColor: theme.colors.successMain,
        backgroundColor: theme.colors.successHover,
        textColor: theme.colors.successMain,
        icon: 'checkmark-circle' as const,
      };
  }
};

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onMarkAsRead }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const riskConfig = getRiskConfig(alert.risk_level as AlertRiskLevel, theme);
  const [expanded, setExpanded] = useState(false);

  const title   = i18n.language === 'rw' ? alert.title_rw   : alert.title_en;
  const message = i18n.language === 'rw' ? alert.message_rw : alert.message_en;
  const shouldTruncate = message.length > 150;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surfaceMain },
      ]}
    >
      {/* Top row: risk badge + district & date */}
      <View style={styles.topRow}>
        <View style={[styles.riskBadge, { backgroundColor: riskConfig.backgroundColor }]}>
          <Ionicons name={riskConfig.icon} size={13} color={riskConfig.textColor} />
          <Text style={[styles.riskText, { color: riskConfig.textColor }]}>
            {alert.risk_level.toUpperCase()}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="location-sharp" size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.district, { color: theme.colors.textSecondary }]}>
            {alert.district}
          </Text>
          <Text style={[styles.separator, { color: theme.colors.iconsMuted }]}> · </Text>
          <Text style={[styles.time, { color: theme.colors.iconsMuted }]}>
            {getRelativeTime(alert.created_at)}
          </Text>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <View style={[styles.unreadDot, { backgroundColor: theme.colors.brandMain }]} />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
          {title}
        </Text>
      </View>

      {/* Message */}
      <Text
        style={[styles.message, { color: theme.colors.textSecondary }]}
        numberOfLines={expanded ? undefined : 3}
      >
        {message}
      </Text>
      {shouldTruncate && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
          <Text style={[styles.readMore, { color: theme.colors.brandMain }]}>
            {expanded ? t('common.readLess') : t('common.readMore')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Mark as read */}
      <TouchableOpacity
        style={[styles.markAsReadButton, { backgroundColor: theme.colors.brandHover }]}
        onPress={() => onMarkAsRead(alert.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="checkmark-done" size={15} color={theme.colors.brandMain} />
        <Text style={[styles.actionText, { color: theme.colors.brandMain }]}>
          {t('alerts.markAsRead')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
  },
  riskText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  district: {
    fontSize: 12,
  },
  separator: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 5,
    flexShrink: 0,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  message: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  markAsReadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
