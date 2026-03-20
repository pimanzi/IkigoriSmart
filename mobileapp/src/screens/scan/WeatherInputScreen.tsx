import React, { useState, useEffect, useRef } from 'react';
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
import { District } from '../../config/districtCoords';
import { useWeather } from '../../hooks/useWeather';
import { isValidTemperature, isValidHumidity, isValidRainfall } from '../../utils/weatherValidation';

interface WeatherInputScreenProps {
  navigation: any;
  route: {
    params: {
      severity: string;
      imageUri: string;
      voiceDistrict?: 'Musanze' | 'Nyabihu';
      voiceAutoRisk?: boolean;
    };
  };
}

type WeatherSource = 'api' | 'manual';

export const WeatherInputScreen: React.FC<WeatherInputScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { severity, imageUri, voiceDistrict, voiceAutoRisk } = route.params;

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const autoPreviewRef = useRef(false);
  const [weatherSource, setWeatherSource] = useState<WeatherSource>('api');
  
  const { data: weatherData, isLoading, isError, refetch } = useWeather(weatherSource === 'api' ? selectedDistrict : null);
  
  const [temperature, setTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [rainfall, setRainfall] = useState('');
  
  const [tempError, setTempError] = useState('');
  const [humidityError, setHumidityError] = useState('');
  const [rainfallError, setRainfallError] = useState('');

  useEffect(() => {
    if (voiceDistrict) {
      setSelectedDistrict(voiceDistrict);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateTemperature = (value: string) => {
    if (!value.trim()) { setTempError(t('scan.weather.validation.temperatureRequired')); return false; }
    if (!isValidTemperature(value)) { setTempError(t('scan.weather.validation.temperatureRange')); return false; }
    setTempError('');
    return true;
  };

  const validateHumidity = (value: string) => {
    if (!value.trim()) { setHumidityError(t('scan.weather.validation.humidityRequired')); return false; }
    if (!isValidHumidity(value)) { setHumidityError(t('scan.weather.validation.humidityRange')); return false; }
    setHumidityError('');
    return true;
  };

  const validateRainfall = (value: string) => {
    if (!value.trim()) { setRainfallError(t('scan.weather.validation.rainfallRequired')); return false; }
    if (!isValidRainfall(value)) { setRainfallError(t('scan.weather.validation.rainfallRange')); return false; }
    setRainfallError('');
    return true;
  };

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
  };

  const handleSourceChange = (source: WeatherSource) => {
    setWeatherSource(source);
  };

  const isManualValid = () => {
    if (!temperature || !humidity || !rainfall) return false;
    if (tempError || humidityError || rainfallError) return false;
    const temp = parseFloat(temperature);
    const hum = parseFloat(humidity);
    const rain = parseFloat(rainfall);
    return !isNaN(temp) && !isNaN(hum) && !isNaN(rain) &&
           temp >= 10 && temp <= 35 &&
           hum >= 0 && hum <= 100 &&
           rain >= 0 && rain <= 500;
  };

  const handlePreview = () => {
    if (!selectedDistrict) return;
    
    if (weatherSource === 'manual') {
      const tempValid = validateTemperature(temperature);
      const humValid = validateHumidity(humidity);
      const rainValid = validateRainfall(rainfall);
      if (!tempValid || !humValid || !rainValid) return;
    }
    
    const finalTemp = weatherSource === 'api' ? weatherData!.temperature : parseFloat(temperature);
    const finalHum = weatherSource === 'api' ? weatherData!.humidity : parseFloat(humidity);
    const finalRain = weatherSource === 'api' ? weatherData!.rainfall : parseFloat(rainfall);

    navigation.navigate('WeatherPreviewScreen', {
      severity,
      temperature: finalTemp,
      humidity: finalHum,
      rainfall: finalRain,
      district: selectedDistrict,
      weatherSource,
      imageUri,
      voiceAutoRisk,
    });
  };

  // Auto-proceed to WeatherPreviewScreen when voiceAutoRisk=true and API weather data arrives
  useEffect(() => {
    if (!voiceAutoRisk || !weatherData || weatherSource !== 'api' || !selectedDistrict) return;
    if (autoPreviewRef.current) return;
    autoPreviewRef.current = true;
    const timer = setTimeout(() => { handlePreview(); }, 800);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherData, voiceAutoRisk]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.brandMain} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {t('scan.weatherInputTitle')}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* District Selection */}
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            {t('scan.selectDistrict')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('scan.selectDistrictSubtitle')}
          </Text>

          <View style={styles.districtRow}>
            {(['Nyabihu', 'Musanze'] as District[]).map((district) => (
              <TouchableOpacity
                key={district}
                style={[
                  styles.districtCard,
                  {
                    backgroundColor: selectedDistrict === district
                      ? theme.colors.brandHover
                      : theme.colors.surfaceHover,
                    borderColor: selectedDistrict === district
                      ? theme.colors.brandMain
                      : 'transparent',
                  },
                ]}
                onPress={() => handleDistrictSelect(district)}
              >
                <Ionicons
                  name="location"
                  size={32}
                  color={selectedDistrict === district ? theme.colors.brandMain : theme.colors.iconsMuted}
                />
                <Text
                  style={[
                    styles.districtText,
                    {
                      color: selectedDistrict === district
                        ? theme.colors.brandMain
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {district}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Weather Source Toggle */}
          {selectedDistrict && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                {t('scan.weatherSource')}
              </Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: weatherSource === 'api'
                        ? theme.colors.brandMain
                        : theme.colors.surfaceHover,
                    },
                  ]}
                  onPress={() => handleSourceChange('api')}
                >
                  <Ionicons
                    name="cloud"
                    size={20}
                    color={weatherSource === 'api' ? '#fff' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      { color: weatherSource === 'api' ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    {t('scan.useCurrentWeather')}
                  </Text>
                </TouchableOpacity>

                {/* MANUAL TOGGLE — hidden from UI, kept for future use
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    {
                      backgroundColor: weatherSource === 'manual'
                        ? theme.colors.brandMain
                        : theme.colors.surfaceHover,
                    },
                  ]}
                  onPress={() => handleSourceChange('manual')}
                >
                  <Ionicons
                    name="create"
                    size={20}
                    color={weatherSource === 'manual' ? '#fff' : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      { color: weatherSource === 'manual' ? '#fff' : theme.colors.textSecondary },
                    ]}
                  >
                    {t('scan.enterManually')}
                  </Text>
                </TouchableOpacity>
                */}
              </View>

              {/* API Weather Display */}
              {weatherSource === 'api' && (
                <View style={styles.weatherSection}>
                  {isLoading ? (
                    <View style={[styles.loadingCard, { backgroundColor: theme.colors.surfaceHover }]}>
                      <ActivityIndicator size="large" color={theme.colors.brandMain} />
                      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                        {t('scan.fetchingWeather')}
                      </Text>
                    </View>
                  ) : isError ? (
                    <View style={[styles.errorCard, { backgroundColor: theme.colors.surfaceHover }]}>
                      <Ionicons name="cloud-offline-outline" size={32} color={theme.colors.errorMain} />
                      <Text style={[styles.errorTitle, { color: theme.colors.textPrimary }]}>
                        {t('scan.fetchError')}
                      </Text>
                      <Text style={[styles.errorSubtitle, { color: theme.colors.textSecondary }]}>
                        {t('scan.fetchErrorSubtitle')}
                      </Text>
                      <TouchableOpacity
                        style={[styles.retryBtn, { backgroundColor: theme.colors.brandMain }]}
                        onPress={() => refetch()}
                      >
                        <Ionicons name="refresh" size={16} color="#fff" />
                        <Text style={styles.retryText}>{t('scan.retry')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : weatherData ? (
                    <>
                      <View style={styles.weatherChips}>
                        <View style={[styles.chip, { backgroundColor: theme.colors.brandHover }]}>
                          <Ionicons name="thermometer" size={20} color={theme.colors.brandMain} />
                          <Text style={[styles.chipValue, { color: theme.colors.textPrimary }]}>
                            {weatherData.temperature}°C
                          </Text>
                          <Text style={[styles.chipLabel, { color: theme.colors.textSecondary }]}>
                            {t('scan.temperature')}
                          </Text>
                        </View>

                        <View style={[styles.chip, { backgroundColor: theme.colors.brandHover }]}>
                          <Ionicons name="water" size={20} color={theme.colors.brandMain} />
                          <Text style={[styles.chipValue, { color: theme.colors.textPrimary }]}>
                            {weatherData.humidity}%
                          </Text>
                          <Text style={[styles.chipLabel, { color: theme.colors.textSecondary }]}>
                            {t('scan.humidity')}
                          </Text>
                        </View>

                        <View style={[styles.chip, { backgroundColor: theme.colors.brandHover }]}>
                          <Ionicons name="rainy" size={20} color={theme.colors.brandMain} />
                          <Text style={[styles.chipValue, { color: theme.colors.textPrimary }]}>
                            {weatherData.rainfall}mm
                          </Text>
                          <Text style={[styles.chipLabel, { color: theme.colors.textSecondary }]}>
                            {t('scan.rainfall')}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.updateRow}>
                        <Text style={[styles.sourceNote, { color: theme.colors.textSecondary }]}>
                          {t('scan.lastUpdated')}: {new Date(weatherData.fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
                          <Ionicons name="refresh-outline" size={16} color={theme.colors.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.sourceNote, { color: theme.colors.textSecondary }]}>
                        {t('scan.weatherSourceNote')} {selectedDistrict}
                      </Text>
                    </>
                  ) : null}
                </View>
              )}

              {/* Manual Input Form — hidden from UI, kept for future use */}
              {false && weatherSource === 'manual' && (
                <View style={styles.formSection}>
                  <View>
                    <View style={styles.inputGroup}>
                      <Ionicons name="thermometer" size={20} color={theme.colors.brandMain} />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.surfaceHover,
                            borderColor: tempError ? theme.colors.errorMain : theme.colors.iconsMuted,
                            color: theme.colors.textPrimary,
                          },
                        ]}
                        placeholder="e.g. 28"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                        value={temperature}
                        onChangeText={setTemperature}
                        onBlur={() => validateTemperature(temperature)}
                      />
                      <Text style={[styles.suffix, { color: theme.colors.textSecondary }]}>°C</Text>
                    </View>
                    {tempError ? (
                      <Text style={[styles.errorText, { color: theme.colors.errorMain }]}>{tempError}</Text>
                    ) : null}
                  </View>

                  <View>
                    <View style={styles.inputGroup}>
                      <Ionicons name="water" size={20} color={theme.colors.brandMain} />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.surfaceHover,
                            borderColor: humidityError ? theme.colors.errorMain : theme.colors.iconsMuted,
                            color: theme.colors.textPrimary,
                          },
                        ]}
                        placeholder="e.g. 75"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                        value={humidity}
                        onChangeText={setHumidity}
                        onBlur={() => validateHumidity(humidity)}
                      />
                      <Text style={[styles.suffix, { color: theme.colors.textSecondary }]}>%</Text>
                    </View>
                    {humidityError ? (
                      <Text style={[styles.errorText, { color: theme.colors.errorMain }]}>{humidityError}</Text>
                    ) : null}
                  </View>

                  <View>
                    <View style={styles.inputGroup}>
                      <Ionicons name="rainy" size={20} color={theme.colors.brandMain} />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            backgroundColor: theme.colors.surfaceHover,
                            borderColor: rainfallError ? theme.colors.errorMain : theme.colors.iconsMuted,
                            color: theme.colors.textPrimary,
                          },
                        ]}
                        placeholder="e.g. 120"
                        placeholderTextColor={theme.colors.textSecondary}
                        keyboardType="numeric"
                        value={rainfall}
                        onChangeText={setRainfall}
                        onBlur={() => validateRainfall(rainfall)}
                      />
                      <Text style={[styles.suffix, { color: theme.colors.textSecondary }]}>mm</Text>
                    </View>
                    {rainfallError ? (
                      <Text style={[styles.errorText, { color: theme.colors.errorMain }]}>{rainfallError}</Text>
                    ) : null}
                  </View>
                </View>
              )}

              {/* CTA Button */}
              <TouchableOpacity
                style={[
                  styles.ctaBtn,
                  {
                    backgroundColor: theme.colors.brandMain,
                    opacity: (weatherSource === 'api' && weatherData) || (weatherSource === 'manual' && isManualValid()) ? 1 : 0.5,
                  },
                ]}
                onPress={handlePreview}
                disabled={!(weatherSource === 'api' && weatherData) && !(weatherSource === 'manual' && isManualValid())}
                activeOpacity={0.8}
              >
                <Text style={styles.ctaText}>{t('scan.previewConfirm')}</Text>
              </TouchableOpacity>
            </>
          )}
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
    marginBottom: spacing.lg,
    paddingVertical: spacing.sm,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.md,
  },
  districtRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  districtCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    gap: spacing.sm,
  },
  districtText: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weatherSection: {
    marginBottom: spacing.lg,
  },
  loadingCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  weatherChips: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  chipValue: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  chipLabel: {
    fontSize: 13,
  },
  sourceNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  refreshBtn: {
    padding: spacing.xs,
  },
  errorCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: 28,
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

export default WeatherInputScreen;
