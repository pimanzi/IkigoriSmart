import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing, borderRadius } from '../theme/spacing';

type UserGroup = 'farmers' | 'admins';

export const TargetAudience: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<UserGroup>('farmers');

  const farmerBenefits = [
    { icon: 'camera-outline' as const, title: t('targetUsers.farmers.diagnostics.title'), desc: t('targetUsers.farmers.diagnostics.description') },
    { icon: 'shield-checkmark-outline' as const, title: t('targetUsers.farmers.losses.title'), desc: t('targetUsers.farmers.losses.description') },
    { icon: 'wallet-outline' as const, title: t('targetUsers.farmers.savings.title'), desc: t('targetUsers.farmers.savings.description') },
    { icon: 'chatbubble-ellipses-outline' as const, title: t('targetUsers.farmers.language.title'), desc: t('targetUsers.farmers.language.description') },
  ];

  const adminBenefits = [
    { icon: 'map-outline' as const, title: t('targetUsers.admins.surveillance.title'), desc: t('targetUsers.admins.surveillance.description') },
    { icon: 'git-branch-outline' as const, title: t('targetUsers.admins.planning.title'), desc: t('targetUsers.admins.planning.description') },
    { icon: 'analytics-outline' as const, title: t('targetUsers.admins.accuracy.title'), desc: t('targetUsers.admins.accuracy.description') },
  ];

  const benefits = activeTab === 'farmers' ? farmerBenefits : adminBenefits;
  const iconBgColor = activeTab === 'farmers' ? theme.colors.brandHover : theme.colors.secondaryHover;
  const iconColor = activeTab === 'farmers' ? theme.colors.brandMain : theme.colors.secondaryMain;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceHover }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
        {t('targetUsers.title')}
      </Text>

      {/* Segmented Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            {
              backgroundColor: activeTab === 'farmers' ? theme.colors.brandMain : theme.colors.surfaceHover,
            },
          ]}
          onPress={() => setActiveTab('farmers')}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="sprout"
            size={18}
            color={activeTab === 'farmers' ? '#fff' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              { color: activeTab === 'farmers' ? '#fff' : theme.colors.textSecondary },
            ]}
          >
            {t('targetUsers.farmersTitle')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            {
              backgroundColor: activeTab === 'admins' ? theme.colors.brandMain : theme.colors.surfaceHover,
            },
          ]}
          onPress={() => setActiveTab('admins')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={activeTab === 'admins' ? '#fff' : theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              { color: activeTab === 'admins' ? '#fff' : theme.colors.textSecondary },
            ]}
          >
            {t('targetUsers.adminsTitle')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Benefits Cards */}
      <View style={styles.benefitsList}>
        {benefits.map((benefit, idx) => (
          <View
            key={idx}
            style={[
              styles.benefitCard,
              { backgroundColor: theme.colors.surfaceMain },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
              <Ionicons name={benefit.icon} size={24} color={iconColor} />
            </View>
            <View style={styles.benefitContent}>
              <Text style={[styles.benefitTitle, { color: theme.colors.textPrimary }]}>
                {benefit.title}
              </Text>
              <Text style={[styles.benefitDesc, { color: theme.colors.textSecondary }]}>
                {benefit.desc}
              </Text>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  benefitDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});
