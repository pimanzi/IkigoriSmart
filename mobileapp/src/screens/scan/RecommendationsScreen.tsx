import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';
import RecommendationItem from '../../components/scan/RecommendationItem';
import StarRating from '../../components/scan/StarRating';

interface RecommendationsScreenProps {
  navigation: any;
  route: {
    params: {
      district: string;
      weatherData: {
        temperature: number;
        humidity: number;
        rainfall: number;
      };
    };
  };
}

export const RecommendationsScreen: React.FC<RecommendationsScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);

  const { weatherData } = route.params;

  const calculateRisk = () => {
    let riskScore = 0;
    if (weatherData.temperature > 30) riskScore += 2;
    else if (weatherData.temperature > 25) riskScore += 1;
    
    if (weatherData.humidity > 80) riskScore += 2;
    else if (weatherData.humidity > 70) riskScore += 1;
    
    if (weatherData.rainfall > 150) riskScore += 2;
    else if (weatherData.rainfall > 100) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  };

  const riskLevel = calculateRisk();

  const riskConfig = {
    low: {
      icon: 'shield-checkmark' as const,
      color: theme.colors.successMain,
      bgColor: theme.colors.successHover,
      label: t('scan.lowSpreadRisk'),
    },
    medium: {
      icon: 'warning' as const,
      color: theme.colors.chart4,
      bgColor: theme.colors.chart4 + '20',
      label: t('scan.mediumSpreadRisk'),
    },
    high: {
      icon: 'flame' as const,
      color: theme.colors.errorMain,
      bgColor: theme.colors.errorHover,
      label: t('scan.highSpreadRisk'),
    },
  };

  const risk = riskConfig[riskLevel];

  const recommendations = [
    {
      icon: 'trash' as const,
      title: t('scan.uprootTitle'),
      description: t('scan.uprootDesc'),
    },
    {
      icon: 'leaf' as const,
      title: t('scan.fungicideTitle'),
      description: t('scan.fungicideDesc'),
    },
    {
      icon: 'shield-checkmark' as const,
      title: t('scan.isolateTitle'),
      description: t('scan.isolateDesc'),
    },
    {
      icon: 'eye' as const,
      title: t('scan.monitorTitle'),
      description: t('scan.monitorDesc'),
    },
  ];

  const handleHome = () => {
    // Navigate to the root of the tab navigator (Home tab)
    navigation.getParent()?.navigate('Home');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {t('scan.spreadRiskTitle')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Risk Result Banner */}
          <View style={[styles.riskBanner, { backgroundColor: risk.bgColor }]}>
            <Ionicons name={risk.icon} size={32} color={risk.color} />
            <Text style={[styles.riskLabel, { color: risk.color }]}>{risk.label}</Text>
          </View>

          {/* Recommendations List */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('scan.immediateActions')}
          </Text>
          <View style={styles.recommendationsList}>
            {recommendations.map((rec, index) => (
              <RecommendationItem
                key={index}
                number={index + 1}
                icon={rec.icon}
                title={rec.title}
                description={rec.description}
              />
            ))}
          </View>

          {/* Feedback Section */}
          <Text style={[styles.feedbackTitle, { color: theme.colors.textPrimary }]}>
            {t('scan.rateThisPrediction')}
          </Text>

          <StarRating onRatingChange={setRating} />

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.surfaceHover,
                borderColor: theme.colors.iconsMuted,
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder={t('scan.shareObservations')}
            placeholderTextColor={theme.colors.textSecondary}
            multiline={true}
            numberOfLines={4}
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.outlineBtn,
                { borderColor: theme.colors.brandMain },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="bookmark-outline" size={20} color={theme.colors.brandMain} />
              <Text style={[styles.outlineBtnText, { color: theme.colors.brandMain }]}>
                {t('scan.saveToHistory')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filledBtn, { backgroundColor: theme.colors.brandMain }]}
              onPress={handleHome}
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color="#fff" />
              <Text style={styles.filledBtnText}>{t('scan.home')}</Text>
            </TouchableOpacity>
          </View>
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
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  riskBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  riskLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  recommendationsList: {
    marginBottom: spacing.lg,
  },
  feedbackTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: spacing.sm,
  },
  textInput: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    fontSize: 15,
    minHeight: 100,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 52,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  outlineBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  filledBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 52,
    borderRadius: borderRadius.md,
  },
  filledBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default RecommendationsScreen;
