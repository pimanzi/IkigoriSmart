import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '../theme/spacing';

export const HowItWorks: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const steps = [
    {
      icon: 'camera-outline' as const,
      title: t('howItWorks.step1.title'),
      desc: t('howItWorks.step1.description'),
      tip: t('howItWorks.step1.tip'),
    },
    {
      icon: 'hardware-chip-outline' as const,
      title: t('howItWorks.step2.title'),
      desc: t('howItWorks.step2.description'),
    },
    {
      icon: 'git-merge-outline' as const,
      title: t('howItWorks.step3.title'),
      desc: t('howItWorks.step3.description'),
    },
    {
      icon: 'bulb-outline' as const,
      title: t('howItWorks.step4.title'),
      desc: t('howItWorks.step4.description'),
    },
    {
      icon: 'bookmark-outline' as const,
      title: t('howItWorks.step5.title'),
      desc: t('howItWorks.step5.description'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {t('howItWorks.title')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('howItWorks.subtitle')}
      </Text>

      {/* Vertical Timeline */}
      <View style={styles.timeline}>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            {/* Left: Number Circle + Connector Line */}
            <View style={styles.leftCol}>
              <View style={[styles.numCircle, { backgroundColor: theme.colors.brandMain }]}>
                <Text style={styles.numText}>{idx + 1}</Text>
              </View>
              {idx < steps.length - 1 && (
                <View style={[styles.dashedLine, { borderColor: theme.colors.brandHover }]} />
              )}
            </View>

            {/* Right: Content */}
            <View style={styles.rightCol}>
              <View style={styles.iconTitleRow}>
                <Ionicons name={step.icon} size={20} color={theme.colors.brandMain} />
                <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
                  {step.title}
                </Text>
              </View>
              <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
                {step.desc}
              </Text>
              {step.tip && (
                <View style={[styles.tipPill, { backgroundColor: theme.colors.brandHover }]}>
                  <Ionicons name="bulb" size={14} color={theme.colors.brandMain} />
                  <Text style={[styles.tipText, { color: theme.colors.brandMain }]}>
                    {step.tip}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  timeline: {
    paddingLeft: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  leftCol: {
    alignItems: 'center',
    width: 40,
    marginRight: spacing.md,
  },
  numCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  dashedLine: {
    width: 2,
    flex: 1,
    marginVertical: spacing.xs,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
  },
  rightCol: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  tipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  tipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
