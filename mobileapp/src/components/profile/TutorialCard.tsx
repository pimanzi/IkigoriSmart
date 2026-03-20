import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import type { Tutorial } from '../../types';

interface TutorialCardProps {
  tutorial: Tutorial & { isSaved: boolean; thumbnailIcon: string };
  onToggleSave: (id: string) => void;
  onPress: (tutorial: Tutorial & { isSaved: boolean; thumbnailIcon: string }) => void;
}

export const TutorialCard: React.FC<TutorialCardProps> = ({ tutorial, onToggleSave, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surfaceMain }]}
      onPress={() => onPress(tutorial)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[styles.thumbnail, { backgroundColor: theme.colors.surfaceHover }]}>
          <Ionicons name={tutorial.thumbnailIcon as any} size={32} color={theme.colors.iconsPrimary} />
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  tutorial.type === 'video' ? theme.colors.infoHover : theme.colors.secondaryHover,
              },
            ]}
          >
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color:
                    tutorial.type === 'video' ? theme.colors.infoMain : theme.colors.secondaryMain,
                },
              ]}
            >
              {tutorial.type === 'video' ? '📹' : '📄'}
            </Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={2}>
            {tutorial.title}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {tutorial.description}
          </Text>
          <View style={styles.footer}>
            <View style={styles.duration}>
              <Ionicons name="time-outline" size={14} color={theme.colors.iconsSecondary} />
              <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                {tutorial.duration}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleSave(tutorial.id);
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={tutorial.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={tutorial.isSaved ? theme.colors.brandMain : theme.colors.iconsMuted}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  typeBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
});
