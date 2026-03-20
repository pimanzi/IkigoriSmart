import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useSavedTutorials } from '../../hooks/useSavedTutorials';
import { useUpdateLastAccessed } from '../../hooks/useUpdateLastAccessed';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNavigation } from '@react-navigation/native';
import type { SavedTutorial } from '../../types';

interface MyLearningTabProps {
  onSwitchToTutorials: () => void;
}

export const MyLearningTab: React.FC<MyLearningTabProps> = ({ onSwitchToTutorials }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: user } = useCurrentUser();
  const profileId = user?.profile?.id ?? null;
  const { savedTutorials = [] } = useSavedTutorials(profileId);
  const { markAccessed } = useUpdateLastAccessed(profileId);
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'reading'>('all');

  const filteredTutorials = useMemo(() => {
    if (typeFilter === 'all') return savedTutorials;
    return savedTutorials.filter((t) => t.tutorial.type === typeFilter);
  }, [savedTutorials, typeFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('learning.neverAccessed');
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCardPress = (savedTutorial: SavedTutorial) => {
    markAccessed(savedTutorial.id);
    navigation.navigate('SavedTutorialDetail' as never, { savedTutorial } as never);
  };

  const topicIconMap: Record<string, string> = {
    scan: 'camera-outline',
    mln: 'leaf-outline',
    ipm: 'shield-checkmark-outline',
    weather: 'cloud-outline',
  };

  const filters: Array<{ key: 'all' | 'video' | 'reading'; label: string; icon: string }> = [
    { key: 'all', label: t('profile.filterAll'), icon: 'apps' },
    { key: 'video', label: t('profile.filterVideo'), icon: 'play-circle' },
    { key: 'reading', label: t('profile.filterReading'), icon: 'document-text' },
  ];

  if (savedTutorials.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bookmark-outline" size={48} color={theme.colors.iconsMuted} />
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {t('learning.empty')}
        </Text>
      </View>
    );
  }

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
              onPress={() => setTypeFilter(filter.key)}
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

      <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
        {filteredTutorials.length} {filteredTutorials.length === 1 ? 'tutorial' : 'tutorials'}
      </Text>

      {filteredTutorials.map((saved) => {
        const progress = saved.progress_percent || 0;
        const isCompleted = progress === 100;

        return (
          <TouchableOpacity
            key={saved.id}
            style={[styles.card, { backgroundColor: theme.colors.surfaceMain }]}
            onPress={() => handleCardPress(saved)}
            activeOpacity={0.7}
          >
            <View style={styles.cardContent}>
              <View style={[styles.iconCircle, { backgroundColor: theme.colors.brandHover }]}>
                <Ionicons
                  name={topicIconMap[saved.tutorial.topic] || 'book-outline'}
                  size={24}
                  color={theme.colors.brandMain}
                />
              </View>

              <View style={styles.cardInfo}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
                    {saved.tutorial.title}
                  </Text>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor:
                          saved.tutorial.type === 'video'
                            ? theme.colors.infoHover
                            : theme.colors.secondaryHover,
                      },
                    ]}
                  >
                    <Ionicons
                      name={saved.tutorial.type === 'video' ? 'play-circle-outline' : 'document-text-outline'}
                      size={14}
                      color={
                        saved.tutorial.type === 'video'
                          ? theme.colors.infoMain
                          : theme.colors.secondaryMain
                      }
                    />
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {
                          color:
                            saved.tutorial.type === 'video'
                              ? theme.colors.infoMain
                              : theme.colors.secondaryMain,
                        },
                      ]}
                    >
                      {saved.tutorial.type === 'video'
                        ? t('tutorials.typeVideo')
                        : t('tutorials.typeReading')}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                  {saved.tutorial.description}
                </Text>

                <View style={styles.meta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {saved.tutorial.duration}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={12} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {formatDate(saved.last_accessed)}
                    </Text>
                  </View>
                </View>

                <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceHover }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: isCompleted
                          ? theme.colors.successMain
                          : theme.colors.brandMain,
                        width: `${progress}%`,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {progress}% complete
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.md,
  },
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
  count: {
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
  },
});
