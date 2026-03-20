import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';

interface SeverityCardProps {
  diagnosisResult: 'healthy' | 'early' | 'moderate' | 'severe';
}

type IoniconsName = 'checkmark-circle' | 'alert' | 'alert-circle' | 'close-circle';

const SeverityCard: React.FC<SeverityCardProps> = ({ diagnosisResult }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const severityConfig: Record<
    'healthy' | 'early' | 'moderate' | 'severe',
    {
      icon: IoniconsName;
      iconColor: string;
      label: string;
      segments: number;
    }
  > = {
    healthy: {
      icon: 'checkmark-circle',
      iconColor: theme.colors.successMain,
      label: t('scan.healthyLabel'),
      segments: 1,
    },
    early: {
      icon: 'alert',
      iconColor: theme.colors.chart4,
      label: t('scan.earlyLabel'),
      segments: 2,
    },
    moderate: {
      icon: 'alert-circle',
      iconColor: theme.colors.chart4,
      label: t('scan.moderateLabel'),
      segments: 4,
    },
    severe: {
      icon: 'close-circle',
      iconColor: theme.colors.errorMain,
      label: t('scan.severeLabel'),
      segments: 5,
    },
  };

  const config = severityConfig[diagnosisResult];
  const desc = t(`scan.${diagnosisResult}Desc`);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceHover }]}>
      <Ionicons
        name={config.icon}
        size={36}
        color={config.iconColor}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: theme.colors.textPrimary }]}>
        {config.label}
      </Text>
      <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
        {desc}
      </Text>
      {/* Severity Bar */}
      <View style={styles.severityBar}>
        {[...Array(5)].map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.severitySegment,
              {
                backgroundColor:
                  idx < config.segments
                    ? idx === 0
                      ? theme.colors.chart3
                      : idx < 4
                        ? theme.colors.chart4
                        : theme.colors.errorMain
                    : theme.colors.surfaceMain,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginBottom: spacing.md,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  severityBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  severitySegment: {
    width: 24,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
});

export default SeverityCard;
