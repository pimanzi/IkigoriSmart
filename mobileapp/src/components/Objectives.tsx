import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const MAX_DESC_LENGTH = 80;

interface ObjectiveItemProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  desc: string;
}

const ObjectiveItem: React.FC<ObjectiveItemProps> = ({ icon, color, title, desc }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const shouldTruncate = desc.length > MAX_DESC_LENGTH;
  const displayText = expanded || !shouldTruncate ? desc : `${desc.substring(0, MAX_DESC_LENGTH)}...`;

  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.rowDesc, { color: theme.colors.textSecondary }]}>
          {displayText}
        </Text>
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
            <Text style={[styles.readMore, { color: theme.colors.brandMain }]}>
              {expanded ? t('common.readLess') : t('common.readMore')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export const Objectives: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const items = [
    {
      icon: <Ionicons name="eye-outline" size={24} color="#ffffff" />,
      color: '#04966a',
      title: t('objectives.earlyDetection.title'),
      desc: t('objectives.earlyDetection.description'),
    },
    {
      icon: <Ionicons name="bar-chart-outline" size={24} color="#ffffff" />,
      color: '#1e3a8a',
      title: t('objectives.severityQuantification.title'),
      desc: t('objectives.severityQuantification.description'),
    },
    {
      icon: <MaterialCommunityIcons name="weather-partly-cloudy" size={24} color="#ffffff" />,
      color: '#f59e0b',
      title: t('objectives.riskFusion.title'),
      desc: t('objectives.riskFusion.description'),
    },
    {
      icon: <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#ffffff" />,
      color: '#7c3aed',
      title: t('objectives.actionableAdvisory.title'),
      desc: t('objectives.actionableAdvisory.description'),
    },
    {
      icon: <Ionicons name="trending-up-outline" size={24} color="#ffffff" />,
      color: '#dc2626',
      title: t('objectives.dataDrivenMonitoring.title'),
      desc: t('objectives.dataDrivenMonitoring.description'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {t('objectives.title')}
      </Text>

      {items.map((item, idx) => (
        <ObjectiveItem key={idx} {...item} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textBlock: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
});
