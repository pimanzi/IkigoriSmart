import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useSavedTutorials } from '../../hooks/useSavedTutorials';
import { useSaveTutorial } from '../../hooks/useSaveTutorial';
import { useDeleteSavedTutorial } from '../../hooks/useDeleteSavedTutorial';
import { EmbeddedContent } from '../../components/profile/EmbeddedContent';
import type { Tutorial } from '../../types';

interface TutorialDetailScreenProps {
  route: {
    params: {
      tutorial: Tutorial;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export const TutorialDetailScreen: React.FC<TutorialDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { tutorial } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: user } = useCurrentUser();
  const profileId = user?.profile?.id ?? null;

  const { savedTutorials = [] } = useSavedTutorials(profileId);
  const { saveTutorial } = useSaveTutorial();
  const { deleteTutorial } = useDeleteSavedTutorial();

  const savedEntry = savedTutorials.find((st) => st.tutorial_id === tutorial.id);
  const isSaved = !!savedEntry;

  const topicIconMap: Record<string, any> = {
    scan: 'camera-outline',
    mln: 'leaf-outline',
    ipm: 'shield-checkmark-outline',
    weather: 'cloud-outline',
  };

  const handleToggleSave = () => {
    if (!profileId) return;
    if (isSaved && savedEntry) {
      deleteTutorial(savedEntry.id);
    } else {
      saveTutorial({ profileId, tutorialId: tutorial.id });
    }
  };

  const hasContentUrl = tutorial.content_url && tutorial.content_url.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.brandMain} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleToggleSave}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={isSaved ? theme.colors.brandMain : theme.colors.iconsMuted}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: theme.colors.surfaceMain }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            {tutorial.title}
          </Text>

          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  tutorial.type === 'video'
                    ? theme.colors.infoHover
                    : theme.colors.secondaryHover,
              },
            ]}
          >
            <Ionicons
              name={tutorial.type === 'video' ? 'play-circle' : 'document-text'}
              size={18}
              color={
                tutorial.type === 'video'
                  ? theme.colors.infoMain
                  : theme.colors.secondaryMain
              }
            />
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color:
                    tutorial.type === 'video'
                      ? theme.colors.infoMain
                      : theme.colors.secondaryMain,
                },
              ]}
            >
              {tutorial.type === 'video'
                ? t('tutorials.typeVideo')
                : t('tutorials.typeReading')}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Ionicons
              name={topicIconMap[tutorial.topic] || 'book-outline'}
              size={20}
              color={theme.colors.brandMain}
            />
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.headerMeta, { color: theme.colors.textSecondary }]}>
              {tutorial.duration}
            </Text>
          </View>

          {tutorial.description ? (
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {tutorial.description}
            </Text>
          ) : null}
        </View>

        {hasContentUrl ? (
          <View style={styles.embeddedContentContainer}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: theme.colors.textPrimary,
                  paddingHorizontal: spacing.lg,
                  marginBottom: spacing.sm,
                },
              ]}
            >
              {t('tutorials.tutorialContent')}
            </Text>
            <EmbeddedContent url={tutorial.content_url!} />
          </View>
        ) : (
          <View style={[styles.noContentBox, { borderColor: theme.colors.surfaceHover }]}>
            <Ionicons name="link-outline" size={32} color={theme.colors.iconsMuted} />
            <Text style={[styles.noContentText, { color: theme.colors.textSecondary }]}>
              {t('tutorials.noContentAvailable')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  headerCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginBottom: spacing.sm,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  headerMeta: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  embeddedContentContainer: {
    marginBottom: spacing.lg,
    minHeight: 250,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  noContentBox: {
    marginHorizontal: spacing.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  noContentText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
