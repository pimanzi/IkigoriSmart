import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { useTranslation } from 'react-i18next';
import { PredictionResponse } from '../../types';
import { useScanProgress } from '../../contexts/ScanProgressContext';

interface DiagnosisScreenProps {
  navigation: any;
  route: {
    params: { 
      predictionResponse: PredictionResponse;
      imageUri: string;
    };
  };
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { predictionResponse, imageUri } = route.params;
  const { setSeverityPredicted } = useScanProgress();

  const severityConfig = [
    {
      icon: 'checkmark-circle' as const,
      iconColor: theme.colors.successMain,
    },
    {
      icon: 'eye' as const,
      iconColor: theme.colors.chart4,
    },
    {
      icon: 'warning' as const,
      iconColor: theme.colors.chart4,
    },
    {
      icon: 'skull' as const,
      iconColor: theme.colors.errorMain,
    },
  ];

  const config = severityConfig[predictionResponse.severity_level];
  const confidence = predictionResponse.confidence * 100;
  const filledBars = Math.round((confidence / 100) * 5);
  const confidenceLevel = confidence >= 70 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';
  const confidenceColor = confidence >= 70 ? theme.colors.successMain : confidence >= 50 ? theme.colors.chart4 : theme.colors.errorMain;
  const severityKeys = ['healthy', 'early', 'moderate', 'severe'];
  const severityKey = severityKeys[predictionResponse.severity_level];
  const severityName = severityKey.charAt(0).toUpperCase() + severityKey.slice(1);

  useEffect(() => {
    setSeverityPredicted(predictionResponse, imageUri, severityName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.brandMain}
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
            {t('scan.diagnosisTitle')}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Captured Image */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.surfaceHover }]}>
          <Image 
            source={{ uri: imageUri }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        </View>

        {/* Severity Card */}
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceHover }]}>
          <Ionicons
            name={config.icon}
            size={36}
            color={config.iconColor}
            style={styles.icon}
          />
          <Text style={[styles.severityLabel, { color: theme.colors.textPrimary }]}>
            {t(`scan.severity.${severityKey}Label`)}
          </Text>
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>
            {t(`scan.severity.${severityKey}Desc`)}
          </Text>
          
          {/* Confidence Bar */}
          <View style={styles.severityBar}>
            {[...Array(5)].map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.severitySegment,
                  {
                    backgroundColor:
                      idx < filledBars
                        ? config.iconColor
                        : theme.colors.surfaceMain,
                  },
                ]}
              />
            ))}
          </View>

          {/* Confidence Info */}
          <View style={styles.confidenceInfo}>
            <Text style={[styles.confidenceText, { color: theme.colors.textSecondary }]}>
              {t('scan.diagnosis.confidenceResult')}
            </Text>
            <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor }]}>
              <Text style={styles.confidenceBadgeText}>
                {t(`scan.diagnosis.confidence${confidenceLevel}`)}
              </Text>
            </View>
          </View>
        </View>

        {/* Weather Forecast Description */}
        <Text style={[styles.forecastText, { color: theme.colors.textSecondary }]}>
          {t('scan.weatherForecast')}
        </Text>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: theme.colors.brandMain }]}
          onPress={() => navigation.navigate('WeatherInputScreen', { severity: severityName, imageUri })}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t('scan.viewWeatherRisk')}</Text>
        </TouchableOpacity>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginBottom: spacing.md,
  },
  severityLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  severityBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  severitySegment: {
    width: 24,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  confidenceInfo: {
    width: '100%',
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  confidenceText: {
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  confidenceBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  confidenceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  forecastText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  ctaBtn: {
    marginTop: spacing.md,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
});

export default DiagnosisScreen;
