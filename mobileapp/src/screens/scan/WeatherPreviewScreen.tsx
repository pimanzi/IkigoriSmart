import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';
import { SpreadRiskRequest } from '../../types';
import { useSpreadRiskPrediction } from '../../hooks/useSpreadRiskPrediction';
import { useScanProgress } from '../../contexts/ScanProgressContext';

interface WeatherPreviewScreenProps {
  navigation: any;
  route: {
    params: {
      severity: string;
      temperature: number;
      humidity: number;
      rainfall: number;
      district: string;
      weatherSource: 'api' | 'manual';
      imageUri: string;
      voiceAutoRisk?: boolean;
    };
  };
}

export const WeatherPreviewScreen: React.FC<WeatherPreviewScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { severity, temperature, humidity, rainfall, district, weatherSource, imageUri, voiceAutoRisk } =
    route.params;

  const { setWeatherPreviewed, pendingVoiceAction, setPendingVoiceAction } = useScanProgress();
  const { predict, isPending } = useSpreadRiskPrediction();
  const [apiError, setApiError] = useState<string | null>(null);

  const getSeverityConfig = (sev: string) => {
    const severityLower = sev.toLowerCase();
    if (severityLower === 'healthy') {
      return { icon: 'checkmark-circle' as const, color: theme.colors.successMain };
    }
    if (severityLower === 'early') {
      return { icon: 'eye' as const, color: theme.colors.chart4 };
    }
    if (severityLower === 'moderate') {
      return { icon: 'warning' as const, color: theme.colors.chart4 };
    }
    return { icon: 'skull' as const, color: theme.colors.errorMain };
  };

  const getTempRisk = (temp: number): { level: string; color: string } => {
    if (temp >= 25 && temp <= 30) return { level: 'highRisk', color: theme.colors.errorMain };
    if (temp >= 22 && temp < 25) return { level: 'moderateRisk', color: theme.colors.chart4 };
    if (temp > 30) return { level: 'moderateRisk', color: theme.colors.chart4 };
    return { level: 'lowRisk', color: theme.colors.successMain };
  };

  const getHumidityRisk = (hum: number): { level: string; color: string } => {
    if (hum > 80) return { level: 'highRisk', color: theme.colors.errorMain };
    if (hum >= 60) return { level: 'moderateRisk', color: theme.colors.chart4 };
    return { level: 'lowRisk', color: theme.colors.successMain };
  };

  const getRainfallRisk = (rain: number): { level: string; color: string } => {
    if (rain < 20) return { level: 'highRisk', color: theme.colors.errorMain };
    if (rain < 50) return { level: 'moderateRisk', color: theme.colors.chart4 };
    return { level: 'lowRisk', color: theme.colors.successMain };
  };

  const getTempRules = (): string => {
    return `• 25–30°C: High Risk\n• 22–25°C: Moderate Risk\n• >30°C: Moderate Risk\n• <22°C: Low Risk`;
  };

  const getHumidityRules = (): string => {
    return `• >80%: High Risk\n• 60–80%: Moderate Risk\n• <60%: Low Risk`;
  };

  const getRainfallRules = (): string => {
    return `• <20mm: High Risk\n• 20–50mm: Moderate Risk\n• ≥50mm: Low Risk`;
  };

  const severityConfig = getSeverityConfig(severity);
  const tempRisk = getTempRisk(temperature);
  const humidityRisk = getHumidityRisk(humidity);
  const rainfallRisk = getRainfallRisk(rainfall);

  const handleRunPrediction = () => {
    setApiError(null);
    const request: SpreadRiskRequest = {
      severity,
      temperature,
      humidity,
      rainfall,
      district,
    };
    predict(request, {
      onSuccess: (result) => {
        navigation.navigate('SpreadRisk', {
          spreadRiskResponse: result,
          severity,
          temperature,
          humidity,
          rainfall,
          district,
          weatherSource,
          imageUri,
        });
      },
      onError: () => {
        setApiError(t('scan.prediction.apiError'));
      },
    });
  };

  // Advance step to weather_previewed when arriving via voice so "risk" command becomes available
  useEffect(() => {
    if (voiceAutoRisk) setWeatherPreviewed();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to voice "risk" command signalled via ScanProgressContext
  useEffect(() => {
    if (pendingVoiceAction !== 'risk') return;
    setPendingVoiceAction(null); // clear immediately to prevent double-trigger
    handleRunPrediction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingVoiceAction]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.brandMain} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {t('scan.weatherSummaryTitle')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Subtitle */}
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('scan.weatherSummarySubtitle')}
        </Text>

        {/* Severity Card */}
        <View style={[styles.severityCard, { backgroundColor: theme.colors.surfaceHover }]}>
          <Ionicons name={severityConfig.icon} size={28} color={severityConfig.color} />
          <View style={styles.severityContent}>
            <Text style={[styles.severityLabel, { color: theme.colors.textSecondary }]}>
              {t('scan.preview.severityLabel')}
            </Text>
            <Text style={[styles.severityValue, { color: severityConfig.color }]}>
              {severity}
            </Text>
          </View>
        </View>

        {/* District Badge */}
        <View style={[styles.badge, { backgroundColor: theme.colors.brandHover }]}>
          <Ionicons name="location" size={16} color={theme.colors.brandMain} />
          <Text style={[styles.badgeText, { color: theme.colors.brandMain }]}>
            {district}
          </Text>
        </View>

        {/* Source Badge */}
        <View
          style={[
            styles.sourceBadge,
            {
              backgroundColor: weatherSource === 'api'
                ? theme.colors.successHover
                : theme.colors.secondaryHover,
            },
          ]}
        >
          <Ionicons
            name={weatherSource === 'api' ? 'cloud' : 'create'}
            size={14}
            color={weatherSource === 'api' ? theme.colors.successMain : theme.colors.secondaryMain}
          />
          <Text
            style={[
              styles.sourceText,
              {
                color: weatherSource === 'api' ? theme.colors.successMain : theme.colors.secondaryMain,
              },
            ]}
          >
            {weatherSource === 'api' ? t('scan.apiData') : t('scan.manuallyEntered')}
          </Text>
        </View>

        {/* Weather Variable Cards */}
        <View style={styles.statsContainer}>
          {/* Temperature Card */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceHover }]}>
            <View style={styles.statHeader}>
              <View style={styles.statLeft}>
                <Ionicons name="thermometer" size={24} color={theme.colors.brandMain} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    {t('scan.temperature')}
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                    {temperature}°C
                  </Text>
                </View>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: tempRisk.color }]}>
                <Text style={styles.riskText}>{t(`scan.preview.${tempRisk.level}`)}</Text>
              </View>
            </View>
            <Text style={[styles.rangeText, { color: theme.colors.textSecondary }]}>
              {getTempRules()}
            </Text>
          </View>

          {/* Humidity Card */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceHover }]}>
            <View style={styles.statHeader}>
              <View style={styles.statLeft}>
                <Ionicons name="water" size={24} color={theme.colors.brandMain} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    {t('scan.humidity')}
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                    {humidity}%
                  </Text>
                </View>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: humidityRisk.color }]}>
                <Text style={styles.riskText}>{t(`scan.preview.${humidityRisk.level}`)}</Text>
              </View>
            </View>
            <Text style={[styles.rangeText, { color: theme.colors.textSecondary }]}>
              {getHumidityRules()}
            </Text>
          </View>

          {/* Rainfall Card */}
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceHover }]}>
            <View style={styles.statHeader}>
              <View style={styles.statLeft}>
                <Ionicons name="rainy" size={24} color={theme.colors.brandMain} />
                <View style={styles.statInfo}>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                    {t('scan.rainfall')}
                  </Text>
                  <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                    {rainfall}mm
                  </Text>
                </View>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: rainfallRisk.color }]}>
                <Text style={styles.riskText}>{t(`scan.preview.${rainfallRisk.level}`)}</Text>
              </View>
            </View>
            <Text style={[styles.rangeText, { color: theme.colors.textSecondary }]}>
              {getRainfallRules()}
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[
            styles.ctaBtn,
            { backgroundColor: theme.colors.brandMain, opacity: isPending ? 0.7 : 1 },
          ]}
          onPress={handleRunPrediction}
          disabled={isPending}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="hardware-chip" size={20} color="#fff" />
              <Text style={styles.ctaText}>{t('scan.runPrediction')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Inline API Error */}
        {apiError && (
          <Text style={[styles.apiError, { color: theme.colors.errorMain }]}>{apiError}</Text>
        )}
      </ScrollView>
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
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
    lineHeight: 20,
  },
  severityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  severityContent: {
    flex: 1,
  },
  severityLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  severityValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  riskText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  rangeText: {
    fontSize: 11,
    lineHeight: 16,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    height: 52,
    borderRadius: borderRadius.md,
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  apiError: {
    marginTop: spacing.sm,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default WeatherPreviewScreen;
