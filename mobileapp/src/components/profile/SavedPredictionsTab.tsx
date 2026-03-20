import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useSavedPredictions } from '../../hooks/useSavedPredictions';
import { useDeletePrediction } from '../../hooks/useDeletePrediction';
import type { SavedPrediction } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function useSeverityColor(severity: string) {
  const { theme } = useTheme();
  switch (severity) {
    case 'Healthy':  return theme.colors.successMain;
    case 'Early':    return theme.colors.chart4;
    case 'Moderate': return theme.colors.infoMain;
    case 'Severe':   return theme.colors.errorMain;
    default:         return theme.colors.textSecondary;
  }
}

function useRiskColor(riskLevel: string) {
  const { theme } = useTheme();
  switch (riskLevel) {
    case 'Low':    return theme.colors.successMain;
    case 'Medium': return theme.colors.chart4;
    case 'High':   return theme.colors.errorMain;
    default:       return theme.colors.textSecondary;
  }
}

// ─── Delete confirm modal ─────────────────────────────────────────────────────

interface DeleteModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

const DeleteConfirmModal: React.FC<DeleteModalProps> = ({ visible, onCancel, onConfirm, isDeleting }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable
          style={[styles.modalCard, { backgroundColor: theme.colors.surfaceMain }]}
          onPress={() => {}}
        >
          {/* Icon */}
          <View style={[styles.modalIconWrap, { backgroundColor: theme.colors.errorHover }]}>
            <Ionicons name="trash" size={26} color={theme.colors.errorMain} />
          </View>

          {/* Text */}
          <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
            {t('profile.predictions.deleteTitle')}
          </Text>
          <Text style={[styles.modalMessage, { color: theme.colors.textSecondary }]}>
            {t('profile.predictions.deleteMessage')}
          </Text>

          {/* Divider */}
          <View style={[styles.modalDivider, { backgroundColor: theme.colors.surfaceHover }]} />

          {/* Buttons */}
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.colors.surfaceHover }]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalBtnText, { color: theme.colors.textPrimary }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: theme.colors.errorMain }]}
              onPress={onConfirm}
              activeOpacity={0.8}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={15} color="#fff" />
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>
                    {t('common.delete')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ─── Prediction card ──────────────────────────────────────────────────────────

interface PredictionCardProps {
  prediction: SavedPrediction;
  onDelete: (id: string) => void;
}

const PredictionCard: React.FC<PredictionCardProps> = ({ prediction, onDelete }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const severityColor = useSeverityColor(prediction.severity);
  const riskColor = useRiskColor(prediction.risk_level);

  const formattedDate = new Date(prediction.created_at).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceMain }]}>
      {/* Thumbnail */}
      <Image
        source={{ uri: prediction.image_url }}
        style={styles.thumbnail}
        resizeMode="cover"
      />

      {/* Info */}
      <View style={styles.cardInfo}>

        {/* Top row: badges + delete */}
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
              <Ionicons name="leaf" size={10} color={severityColor} />
              <Text style={[styles.badgeText, { color: severityColor }]}>
                {prediction.severity}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: riskColor + '20' }]}>
              <Ionicons name="warning" size={10} color={riskColor} />
              <Text style={[styles.badgeText, { color: riskColor }]}>
                {prediction.risk_level} {t('profile.predictions.risk')}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onDelete(prediction.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[styles.deleteBtn, { backgroundColor: theme.colors.errorHover }]}
          >
            <Ionicons name="trash-outline" size={14} color={theme.colors.errorMain} />
          </TouchableOpacity>
        </View>

        {/* District + date */}
        <View style={styles.metaRow}>
          <Ionicons name="location-sharp" size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {prediction.district}
          </Text>
          <View style={[styles.dot, { backgroundColor: theme.colors.iconsMuted }]} />
          <Ionicons name="calendar-clear" size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
            {formattedDate}
          </Text>
        </View>

        {/* Weather row */}
        <View style={styles.weatherRow}>
          <View style={styles.weatherItem}>
            <Ionicons name="thermometer" size={12} color={theme.colors.chart4} />
            <Text style={[styles.weatherText, { color: theme.colors.textSecondary }]}>
              {prediction.temperature_c}°C
            </Text>
          </View>
          <View style={styles.weatherItem}>
            <Ionicons name="water" size={12} color={theme.colors.infoMain} />
            <Text style={[styles.weatherText, { color: theme.colors.textSecondary }]}>
              {prediction.humidity_pct}%
            </Text>
          </View>
          <View style={styles.weatherItem}>
            <Ionicons name="rainy" size={12} color={theme.colors.brandMain} />
            <Text style={[styles.weatherText, { color: theme.colors.textSecondary }]}>
              {prediction.rainfall_mm}mm
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

// ─── Tab ─────────────────────────────────────────────────────────────────────

export const SavedPredictionsTab: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const profileId = user?.profile?.id ?? null;
  const { savedPredictions, isLoading, isError, refetch } = useSavedPredictions(profileId);
  const { mutate: deletePrediction, isPending: isDeleting } = useDeletePrediction();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => setPendingDeleteId(id);

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    deletePrediction(pendingDeleteId, {
      onSuccess: () => {
        setPendingDeleteId(null);
        Toast.show({ type: 'success', text1: t('profile.predictions.deleteSuccess') });
      },
      onError: () => {
        setPendingDeleteId(null);
        Toast.show({ type: 'error', text1: t('profile.predictions.deleteError') });
      },
    });
  };

  if (isUserLoading || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.brandMain} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.errorMain + '15' }]}>
          <Ionicons name="cloud-offline" size={36} color={theme.colors.errorMain} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
          {t('profile.predictions.loadError')}
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: theme.colors.brandMain }]}
          onPress={() => refetch()}
        >
          <Ionicons name="refresh" size={14} color="#fff" />
          <Text style={styles.retryBtnText}>{t('profile.predictions.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (savedPredictions.length === 0) {
    return (
      <View style={styles.center}>
        <View style={[styles.iconCircle, { backgroundColor: theme.colors.brandMain + '15' }]}>
          <Ionicons name="scan-circle" size={36} color={theme.colors.brandMain} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
          {t('profile.predictions.empty')}
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          {t('profile.predictions.emptySubtext')}
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {/* Header */}
        <View style={styles.listHeader}>
          <View style={styles.listHeaderLeft}>
            <Ionicons name="time" size={16} color={theme.colors.brandMain} />
            <Text style={[styles.listTitle, { color: theme.colors.textPrimary }]}>
              {t('profile.predictions.title')}
            </Text>
          </View>
          <Text style={[styles.count, { color: theme.colors.textSecondary }]}>
            {t('profile.predictions.count_other', { count: savedPredictions.length })}
          </Text>
        </View>

        {savedPredictions.map((prediction) => (
          <PredictionCard
            key={prediction.id}
            prediction={prediction}
            onDelete={handleDelete}
          />
        ))}
      </ScrollView>

      <DeleteConfirmModal
        visible={pendingDeleteId !== null}
        onCancel={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl * 2,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  retryBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  count: {
    fontSize: 12,
  },
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  thumbnail: {
    width: 88,
    height: 120,
  },
  cardInfo: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
    marginRight: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  metaText: {
    fontSize: 11,
  },
  weatherRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  weatherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  weatherText: {
    fontSize: 11,
  },
  // ── Modal ──
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.medium,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalDivider: {
    width: '100%',
    height: 1,
    marginVertical: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.md,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
