import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

interface ProfileTabBarProps {
  activeTab: 'profile' | 'tutorials' | 'mylearning' | 'predictions';
  onTabChange: (tab: 'profile' | 'tutorials' | 'mylearning' | 'predictions') => void;
}

export const ProfileTabBar: React.FC<ProfileTabBarProps> = ({ activeTab, onTabChange }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const tabs = [
    { key: 'profile' as const,     label: t('profile.tabProfile'),    icon: 'person' as const },
    { key: 'tutorials' as const,   label: t('profile.tabTutorials'),  icon: 'book' as const },
    { key: 'mylearning' as const,  label: t('profile.tabMyLearning'), icon: 'bookmark' as const },
    { key: 'predictions' as const, label: t('profile.tabPredictions'), icon: 'scan-circle-outline' as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { borderBottomColor: theme.colors.brandMain, borderBottomWidth: 2 },
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={isActive ? theme.colors.brandMain : theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? theme.colors.brandMain : theme.colors.textSecondary,
                  fontWeight: isActive ? '700' : '600',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  label: {
    fontSize: 13,
  },
});
