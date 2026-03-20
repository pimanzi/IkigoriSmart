import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useNotes } from '../../hooks/useNotes';
import { useAddNote } from '../../hooks/useAddNote';
import { useDeleteNote } from '../../hooks/useDeleteNote';
import { useUpdateProgress } from '../../hooks/useUpdateProgress';
import { useDeleteSavedTutorial } from '../../hooks/useDeleteSavedTutorial';
import { EmbeddedContent } from '../../components/profile/EmbeddedContent';
import type { SavedTutorial } from '../../types';

interface SavedTutorialDetailScreenProps {
  route: {
    params: {
      savedTutorial: SavedTutorial;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

export const SavedTutorialDetailScreen: React.FC<SavedTutorialDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { savedTutorial } = route.params;
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: user } = useCurrentUser();
  const profileId = user?.profile?.id ?? null;

  const [noteInput, setNoteInput] = useState('');
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [progressInput, setProgressInput] = useState(String(savedTutorial.progress_percent || 0));
  const [currentProgress, setCurrentProgress] = useState(savedTutorial.progress_percent || 0);

  const { notes = [], isLoading: notesLoading } = useNotes(savedTutorial.tutorial_id, profileId);
  const { addNote, isPending: addingNote } = useAddNote(savedTutorial.tutorial_id, profileId);
  const { deleteNote } = useDeleteNote(savedTutorial.tutorial_id, profileId);
  const { updateProgress, isPending: updatingProgress } = useUpdateProgress(profileId);
  const { deleteTutorial } = useDeleteSavedTutorial();

  const topicIconMap: Record<string, any> = {
    scan: 'camera-outline',
    mln: 'leaf-outline',
    ipm: 'shield-checkmark-outline',
    weather: 'cloud-outline',
  };

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

  const handleAddNote = () => {
    if (!noteInput.trim() || !profileId) return;
    addNote(
      {
        user_id: profileId,
        tutorial_id: savedTutorial.tutorial_id,
        content: noteInput.trim(),
      },
      {
        onSuccess: () => {
          setNoteInput('');
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert(t('learning.deleteNoteTitle'), t('learning.deleteNoteMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deleteNote(noteId),
      },
    ]);
  };

  const handleUpdateProgress = () => {
    const progress = parseInt(progressInput, 10);
    if (isNaN(progress) || progress < 0 || progress > 100) return;

    updateProgress(
      {
        saved_tutorial_id: savedTutorial.id,
        progress_percent: progress,
      },
      {
        onSuccess: () => {
          setCurrentProgress(progress);
          setProgressModalVisible(false);
        },
      }
    );
  };

  const handleDelete = () => {
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    deleteTutorial(savedTutorial.id);
    setDeleteModalVisible(false);
    navigation.goBack();
  };

  const hasContentUrl =
    savedTutorial.tutorial.content_url && savedTutorial.tutorial.content_url.trim().length > 0;

  // Debug logging
  console.log('Tutorial content_url:', savedTutorial.tutorial.content_url);
  console.log('Has content URL:', hasContentUrl);
  
  // TEST: Use a test YouTube URL if no content_url exists (REMOVE THIS AFTER TESTING)
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const displayUrl = savedTutorial.tutorial.content_url || testUrl;
  const shouldShowContent = hasContentUrl || true; // Always show for testing

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
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.headerCard, { backgroundColor: theme.colors.surfaceMain }]}>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            {savedTutorial.tutorial.title}
          </Text>

          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  savedTutorial.tutorial.type === 'video'
                    ? theme.colors.infoHover
                    : theme.colors.secondaryHover,
              },
            ]}
          >
            <Ionicons
              name={savedTutorial.tutorial.type === 'video' ? 'play-circle' : 'document-text'}
              size={18}
              color={
                savedTutorial.tutorial.type === 'video'
                  ? theme.colors.infoMain
                  : theme.colors.secondaryMain
              }
            />
            <Text
              style={[
                styles.typeBadgeText,
                {
                  color:
                    savedTutorial.tutorial.type === 'video'
                      ? theme.colors.infoMain
                      : theme.colors.secondaryMain,
                },
              ]}
            >
              {savedTutorial.tutorial.type === 'video'
                ? t('tutorials.typeVideo')
                : t('tutorials.typeReading')}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Ionicons
              name={topicIconMap[savedTutorial.tutorial.topic] || 'book-outline'}
              size={20}
              color={theme.colors.brandMain}
            />
            <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.headerMeta, { color: theme.colors.textSecondary }]}>
              {savedTutorial.tutorial.duration}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Ionicons name="bookmark-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.headerMeta, { color: theme.colors.textSecondary }]}>
              {t('learning.savedOn')} {formatDate(savedTutorial.saved_at)}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <Ionicons name="eye-outline" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.headerMeta, { color: theme.colors.textSecondary }]}>
              {t('learning.lastAccessed')} {formatDate(savedTutorial.last_accessed)}
            </Text>
          </View>
        </View>

        {/* Embedded Content - Replaces the old clickable link */}
        {shouldShowContent ? (
          <View style={styles.embeddedContentContainer}>
            <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary, paddingHorizontal: spacing.lg, marginBottom: spacing.sm }]}>
              Tutorial Content
            </Text>
            <EmbeddedContent url={displayUrl} />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
            {t('learning.progressLabel')}
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceHover }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor:
                    currentProgress === 100
                      ? theme.colors.successMain
                      : theme.colors.brandMain,
                  width: `${currentProgress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: theme.colors.textPrimary }]}>
            {currentProgress}%
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textPrimary }]}>
            {t('learning.addNoteLabel')}
          </Text>
          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: theme.colors.surfaceMain,
                borderColor: theme.colors.surfaceHover,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder={t('learning.notePlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={noteInput}
            onChangeText={setNoteInput}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.addNoteButton,
              {
                backgroundColor:
                  noteInput.trim() && !addingNote ? theme.colors.brandMain : theme.colors.surfaceHover,
              },
            ]}
            onPress={handleAddNote}
            disabled={!noteInput.trim() || addingNote}
            activeOpacity={0.7}
          >
            {addingNote ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text
                style={[
                  styles.addNoteButtonText,
                  { color: noteInput.trim() ? '#ffffff' : theme.colors.iconsMuted },
                ]}
              >
                {t('learning.addNote')}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {notesLoading ? (
            <ActivityIndicator size="large" color={theme.colors.brandMain} />
          ) : notes.length === 0 ? (
            <View style={[styles.emptyNotes, { borderColor: theme.colors.surfaceHover }]}>
              <Ionicons name="document-outline" size={32} color={theme.colors.iconsMuted} />
              <Text style={[styles.emptyNotesText, { color: theme.colors.textSecondary }]}>
                {t('learning.noNotes')}
              </Text>
            </View>
          ) : (
            <FlatList
              data={notes}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={[styles.noteCard, { backgroundColor: theme.colors.surfaceHover }]}>
                  <TouchableOpacity
                    style={styles.deleteNoteButton}
                    onPress={() => handleDeleteNote(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.colors.errorMain} />
                  </TouchableOpacity>
                  <Text style={[styles.noteContent, { color: theme.colors.textPrimary }]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.noteDate, { color: theme.colors.textSecondary }]}>
                    {t('learning.noteAdded')} {formatDate(item.created_at)}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.brandMain }]}
            onPress={() => setProgressModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.actionButtonText}>{t('learning.updateProgress')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.errorHover }]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.errorMain} />
            <Text style={[styles.deleteButtonText, { color: theme.colors.errorMain }]}>
              {t('learning.delete')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={progressModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surfaceMain }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {t('learning.editProgressTitle')}
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.surfaceMain,
                  borderColor: theme.colors.surfaceHover,
                  color: theme.colors.textPrimary,
                },
              ]}
              value={progressInput}
              onChangeText={setProgressInput}
              keyboardType="number-pad"
              placeholder="0–100"
              placeholderTextColor={theme.colors.textSecondary}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surfaceHover }]}
                onPress={() => setProgressModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.brandMain }]}
                onPress={handleUpdateProgress}
                disabled={updatingProgress}
                activeOpacity={0.7}
              >
                {updatingProgress ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                    {t('common.confirm')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surfaceMain }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
              {t('learning.deleteConfirmTitle')}
            </Text>
            <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
              {t('learning.deleteConfirmMessage')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.surfaceHover }]}
                onPress={() => setDeleteModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.textPrimary }]}>
                  {t('common.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.errorMain }]}
                onPress={confirmDelete}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                  {t('learning.delete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
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
  contentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  embeddedContentContainer: {
    marginBottom: spacing.lg,
    minHeight: 250,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
  },
  noteInput: {
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: spacing.sm,
  },
  addNoteButton: {
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNoteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyNotes: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyNotesText: {
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  noteCard: {
    width: 280,
    padding: spacing.md,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  deleteNoteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  noteContent: {
    fontSize: 13,
    marginBottom: spacing.sm,
    paddingRight: spacing.lg,
  },
  noteDate: {
    fontSize: 11,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: spacing.lg,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  modalMessage: {
    fontSize: 14,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
