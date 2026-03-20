import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { TutorialType } from '../../types/profileTypes';
import { TutorialCard } from './TutorialCard';
import { useTutorials } from '../../hooks/useTutorials';
import { useSavedTutorials } from '../../hooks/useSavedTutorials';
import { useSaveTutorial } from '../../hooks/useSaveTutorial';
import { useDeleteSavedTutorial } from '../../hooks/useDeleteSavedTutorial';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import type { Tutorial } from '../../types';

interface TutorialsTabProps {
  typeFilter: 'all' | TutorialType;
  onTypeFilterChange: (filter: 'all' | TutorialType) => void;
}

export const TutorialsTab: React.FC<TutorialsTabProps> = ({
  typeFilter,
  onTypeFilterChange,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: user } = useCurrentUser();
  const { tutorials = [], isLoading } = useTutorials();
  const { savedTutorials = [] } = useSavedTutorials(user?.profile?.id ?? null);
  const { saveTutorial: doSaveTutorial } = useSaveTutorial();
  const { deleteTutorial } = useDeleteSavedTutorial();

  const savedIds = useMemo(
    () => new Set(savedTutorials.map((st) => st.tutorial_id)),
    [savedTutorials]
  );

  const filteredTutorials = useMemo(() => {
    if (typeFilter === 'all') return tutorials;
    return tutorials.filter((t) => t.type === typeFilter);
  }, [tutorials, typeFilter]);

  const topicIconMap: Record<string, string> = {
    scan: 'camera-outline',
    mln: 'leaf-outline',
    ipm: 'shield-checkmark-outline',
    weather: 'cloud-outline',
  };

  const handleToggleSave = (tutorialId: string) => {
    if (!user?.profile?.id) return;

    if (savedIds.has(tutorialId)) {
      const saved = savedTutorials.find((st) => st.tutorial_id === tutorialId);
      if (saved) deleteTutorial(saved.id);
    } else {
      doSaveTutorial({ profileId: user.profile.id, tutorialId });
    }
  };

  const handlePress = (tutorial: Tutorial & { isSaved: boolean; thumbnailIcon: string }) => {
    (navigation as any).navigate('TutorialDetail', { tutorial });
  };

  const filters: Array<{ key: 'all' | TutorialType; label: string; icon: string }> = [
    { key: 'all', label: t('profile.filterAll'), icon: 'apps' },
    { key: 'video', label: t('profile.filterVideo'), icon: 'play-circle' },
    { key: 'reading', label: t('profile.filterReading'), icon: 'document-text' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = typeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? theme.colors.brandMain : theme.colors.surfaceHover,
                },
              ]}
              onPress={() => onTypeFilterChange(filter.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={isActive ? '#ffffff' : theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#ffffff' : theme.colors.textSecondary },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.brandMain} />
        </View>
      ) : (
        <>
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            {filteredTutorials.length} {t('profile.tutorials')}
          </Text>

          {filteredTutorials.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={64} color={theme.colors.iconsMuted} />
              <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
                {t('profile.noTutorialsFound')}
              </Text>
            </View>
          ) : (
            filteredTutorials.map((tutorial) => (
              <TutorialCard
                key={tutorial.id}
                tutorial={{
                  ...tutorial,
                  isSaved: savedIds.has(tutorial.id),
                  thumbnailIcon: topicIconMap[tutorial.topic] ?? 'book-outline',
                }}
                onToggleSave={handleToggleSave}
                onPress={handlePress}
              />
            ))
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loaderContainer: {
    paddingVertical: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.md,
  },
});
