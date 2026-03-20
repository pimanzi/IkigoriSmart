import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';
import { SpreadRiskResponse } from '../../types';
import { useScanProgress } from '../../contexts/ScanProgressContext';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useIPMRecommendations } from '../../hooks/useIPMRecommendations';
import { useSavePrediction } from '../../hooks/useSavePrediction';
import { useSaveFeedback } from '../../hooks/useSaveFeedback';
import Toast from 'react-native-toast-message';
import StarRating from '../../components/scan/StarRating';
import RecommendationItem from '../../components/scan/RecommendationItem';

type FilterType = 'all' | 'immediate' | 'monitor' | 'preventive';

interface SpreadRiskScreenProps {
  navigation: any;
  route: {
    params: {
      spreadRiskResponse: SpreadRiskResponse;
      severity: string;
      temperature: number;
      humidity: number;
      rainfall: number;
      district: string;
      weatherSource: 'api' | 'manual';
      imageUri: string;
    };
  };
}

export const SpreadRiskScreen: React.FC<SpreadRiskScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    spreadRiskResponse,
    severity,
    temperature,
    humidity,
    rainfall,
    district,
    weatherSource,
    imageUri,
  } = route.params;

  const { setRiskPredicted, pendingVoiceAction, setPendingVoiceAction } = useScanProgress();

  useEffect(() => {
    setRiskPredicted(spreadRiskResponse, severity, district, temperature, humidity, rainfall, weatherSource, imageUri);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: currentUser } = useCurrentUser();
  const authId = currentUser?.id ?? '';
  const profileId = currentUser?.profile.id ?? '';

  const {
    recommendations,
    isLoading,
    isError,
    refetch,
  } = useIPMRecommendations(severity, spreadRiskResponse.risk_level);

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const actionTypeConfig: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
    immediate: { icon: 'flash-outline',            color: theme.colors.brandMain },
    monitor:   { icon: 'eye-outline',              color: theme.colors.errorMain },
    preventive: { icon: 'shield-checkmark-outline', color: theme.colors.chart4 },
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all',        label: t('scan.ipm.filterAll') },
    { key: 'immediate',  label: t('scan.ipm.immediate') },
    { key: 'monitor',    label: t('scan.ipm.monitor') },
    { key: 'preventive', label: t('scan.ipm.preventive') },
  ];

  const filteredRecommendations =
    activeFilter === 'all'
      ? recommendations
      : recommendations.filter((r) => r.action_type === activeFilter);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [predictionId, setPredictionId] = useState<string | null>(null);

  const { saveHistory, isPending: savePending, isSuccess: saveSuccess } = useSavePrediction();
  const { submitFeedback, isPending: feedbackPending } = useSaveFeedback();

  // ─── Risk banner config ────────────────────────────────────────────────────

  const riskConfig = {
    Low: {
      icon: 'shield-checkmark' as const,
      background: theme.colors.successMain,
      label: t('scan.lowSpreadRisk'),
    },
    Medium: {
      icon: 'warning' as const,
      background: theme.colors.chart4,
      label: t('scan.mediumSpreadRisk'),
    },
    High: {
      icon: 'flame' as const,
      background: theme.colors.errorMain,
      label: t('scan.highSpreadRisk'),
    },
  };

  const risk =
    riskConfig[spreadRiskResponse.risk_level as keyof typeof riskConfig] ?? riskConfig.Low;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveHistory = () => {
    saveHistory(
      {
        imageUri,
        authId,
        profileId,
        severity,
        temperature,
        humidity,
        rainfall,
        district,
        riskLevel: spreadRiskResponse.risk_level,
        weatherSource,
      },
      {
        onSuccess: (id) => {
          setPredictionId(id);
        },
      }
    );
  };

  // React to voice "save" or "feedback" commands signalled via ScanProgressContext
  useEffect(() => {
    if (pendingVoiceAction === 'save') {
      setPendingVoiceAction(null);
      handleSaveHistory();
    } else if (pendingVoiceAction === 'feedback') {
      setPendingVoiceAction(null);
      handleSubmitFeedback();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingVoiceAction]);

  const handleSubmitFeedback = () => {
    if (!predictionId) {
      Toast.show({
        type: 'error',
        text1: t('scan.feedback.savePredictionFirst'),
      });
      return;
    }
    submitFeedback(
      {
        prediction_id: predictionId,
        user_id: profileId,
        comment,
        rating,
      },
      {
        onSuccess: () => {
          setRating(0);
          setComment('');
        },
      }
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.brandMain} />
            </TouchableOpacity>
            <Text style={[styles.screenTitle, { color: theme.colors.textPrimary }]}>
              {t('scan.spreadRiskTitle')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* ── Risk Result Banner ─────────────────────────────────────── */}
          <View style={styles.riskBanner}>
            <Ionicons name={risk.icon} size={40} color={risk.background} />
            <Text style={[styles.riskLabel, { color: theme.colors.textPrimary }]}>
              {risk.label}
            </Text>
          </View>

          {/* ── IPM Recommendations ────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('scan.immediateActions')}
          </Text>

          {isLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color={theme.colors.brandMain} />
            </View>
          ) : isError ? (
            <View style={styles.centerBox}>
              <Text style={[styles.centerMsg, { color: theme.colors.errorMain }]}>
                {t('scan.ipm.loadError')}
              </Text>
              <TouchableOpacity
                style={[styles.retryBtn, { borderColor: theme.colors.brandMain }]}
                onPress={() => refetch()}
              >
                <Text style={[styles.retryBtnText, { color: theme.colors.brandMain }]}>
                  {t('scan.ipm.retry')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Filter Bar */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterBar}
              >
                {filters.map(({ key, label }) => {
                  const active = activeFilter === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: active
                            ? theme.colors.brandMain
                            : theme.colors.surfaceHover,
                          borderColor: active
                            ? theme.colors.brandMain
                            : theme.colors.surfaceHover,
                        },
                      ]}
                      onPress={() => setActiveFilter(key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          { color: active ? '#fff' : theme.colors.textSecondary },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Recommendation Cards */}
              {recommendations.length === 0 ? (
                <View style={styles.centerBox}>
                  <Text style={[styles.centerMsg, { color: theme.colors.textSecondary }]}>
                    {t('scan.ipm.empty')}
                  </Text>
                </View>
              ) : activeFilter === 'all' ? (
                // Grouped by action type with coloured section headers
                <View style={styles.recommendationsList}>
                  {(['immediate', 'monitor', 'preventive'] as const).map((type) => {
                    const items = recommendations.filter((r) => r.action_type === type);
                    if (items.length === 0) return null;
                    const cfg = actionTypeConfig[type];
                    return (
                      <View key={type}>
                        <View style={styles.categoryHeader}>
                          <Ionicons name={cfg.icon} size={16} color={cfg.color} />
                          <Text style={[styles.categoryLabel, { color: cfg.color }]}>
                            {t(`scan.ipm.${type}`)}
                          </Text>
                        </View>
                        {items.map((rec, index) => (
                          <RecommendationItem
                            key={rec.id}
                            number={index + 1}
                            icon={cfg.icon}
                            color={cfg.color}
                            title={i18n.language === 'rw' ? rec.title_rw : rec.title_en}
                            description={i18n.language === 'rw' ? rec.description_rw : rec.description_en}
                          />
                        ))}
                      </View>
                    );
                  })}
                </View>
              ) : filteredRecommendations.length === 0 ? (
                <View style={styles.centerBox}>
                  <Text style={[styles.centerMsg, { color: theme.colors.textSecondary }]}>
                    {t('scan.ipm.empty')}
                  </Text>
                </View>
              ) : (
                // Flat list for a specific filter
                <View style={styles.recommendationsList}>
                  {filteredRecommendations.map((rec, index) => (
                    <RecommendationItem
                      key={rec.id}
                      number={index + 1}
                      icon={actionTypeConfig[rec.action_type]?.icon ?? 'information-circle-outline'}
                      color={actionTypeConfig[rec.action_type]?.color}
                      title={i18n.language === 'rw' ? rec.title_rw : rec.title_en}
                      description={i18n.language === 'rw' ? rec.description_rw : rec.description_en}
                    />
                  ))}
                </View>
              )}
            </>
          )}

          {/* ── Save History Button ────────────────────────────────────── */}
          <TouchableOpacity
            style={[
              styles.outlineBtn,
              {
                borderColor: theme.colors.brandMain,
                opacity: savePending ? 0.7 : 1,
              },
            ]}
            onPress={handleSaveHistory}
            disabled={savePending || saveSuccess}
            activeOpacity={0.8}
          >
            {savePending ? (
              <ActivityIndicator size="small" color={theme.colors.brandMain} />
            ) : (
              <>
                <Ionicons name="bookmark-outline" size={20} color={theme.colors.brandMain} />
                <Text style={[styles.outlineBtnText, { color: theme.colors.brandMain }]}>
                  {t('scan.history.save')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ── Feedback Section ───────────────────────────────────────── */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('scan.feedback.title')}
          </Text>

          <StarRating onRatingChange={setRating} />

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceHover,
                borderColor: theme.colors.surfaceHover,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder={t('scan.feedback.placeholder')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            maxLength={300}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: theme.colors.brandMain,
                opacity: rating === 0 || feedbackPending || !predictionId ? 0.5 : 1,
              },
            ]}
            onPress={handleSubmitFeedback}
            disabled={rating === 0 || feedbackPending || !predictionId}
            activeOpacity={0.8}
          >
            {feedbackPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>{t('scan.feedback.submit')}</Text>
            )}
          </TouchableOpacity>

          {/* Home Button */}
          <TouchableOpacity
            style={[styles.homeBtn, { backgroundColor: theme.colors.brandMain }]}
            onPress={() => navigation.getParent()?.navigate('Home')}
            activeOpacity={0.8}
          >
            <Ionicons name="home" size={20} color="#fff" />
            <Text style={styles.homeBtnText}>{t('scan.home')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  screenTitle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  riskBanner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  riskLabel: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  centerBox: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  centerMsg: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full ?? 999,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  recommendationsList: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 15,
    height: 100,
    marginBottom: spacing.md,
  },
  submitBtn: {
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  outlineBtn: {
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  outlineBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  homeBtn: {
    height: 52,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  homeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SpreadRiskScreen;
