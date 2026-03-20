import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { PrimaryButton } from '../../components/auth/PrimaryButton';
import { OutlineButton } from '../../components/auth/OutlineButton';
import type { StackScreenProps } from '@react-navigation/stack';
import type { AuthStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

// Images
const pic1 = require('../../../assets/images/pic1.png');
const pic2 = require('../../../assets/images/pic2.png');
const hero = require('../../../assets/images/hero.png');

// Calculate proportions - images take less space so text is higher
const IMAGE_SECTION_HEIGHT = height * 0.42;
const IMAGE_WIDTH = width * 0.38; // increased from 0.32
const IMAGE_HEIGHT = IMAGE_WIDTH * 1.45; // slightly taller

type Props = StackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, themeMode, toggleTheme } = useTheme();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'rw' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.brandMain }]}
    >
      {/* Top Section with Brand Background */}
      <View
        style={[styles.topSection, { backgroundColor: theme.colors.brandMain }]}
      >
        {/* Top Bar with Language & Theme Toggle */}
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <View style={styles.topBarRight}>
            {/* Dark mode toggle */}
            <TouchableOpacity
              style={[
                styles.iconBtn,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
              onPress={toggleTheme}
              activeOpacity={0.7}
            >
              <Ionicons
                name={themeMode === 'dark' ? 'sunny' : 'moon'}
                size={18}
                color="#ffffff"
              />
            </TouchableOpacity>

            {/* Language toggle */}
            <TouchableOpacity
              style={[
                styles.langPill,
                { backgroundColor: 'rgba(255,255,255,0.2)' },
              ]}
              onPress={toggleLanguage}
              activeOpacity={0.7}
            >
              <Text style={styles.langEmoji}>
                {i18n.language === 'en' ? '🇬🇧' : '🇷🇼'}
              </Text>
              <Text style={[styles.langText, { color: '#ffffff' }]}>
                {i18n.language.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Images Section - Creative Overlapping Layout */}
        <View style={styles.heroSection}>
          {/* Left Image - Offset to left, slightly lower */}
          <View style={[styles.imageCard, styles.imageLeft]}>
            <Image source={pic1} style={styles.heroImage} resizeMode="cover" />
          </View>

          {/* Center Image - Front and center, slightly higher */}
          <View style={[styles.imageCard, styles.imageCenter]}>
            <Image source={hero} style={styles.heroImage} resizeMode="cover" />
          </View>

          {/* Right Image - Offset to right, slightly lower */}
          <View style={[styles.imageCard, styles.imageRight]}>
            <Image source={pic2} style={styles.heroImage} resizeMode="cover" />
          </View>
        </View>
      </View>

      {/* Bottom Section with White Background and Curved Top */}
      <View
        style={[
          styles.bottomSection,
          { backgroundColor: theme.colors.surfaceMain },
        ]}
      >
        {/* Content */}
        <View style={styles.contentSection}>
          {/* Logo on its own line */}
          <View style={styles.logoCircleWrapper}>
            <View
              style={[
                styles.logoCircle,
                { backgroundColor: theme.colors.brandMain },
              ]}
            >
              <Ionicons name="leaf" size={22} color="#ffffff" />
            </View>
          </View>
          {/* App Name on its own line */}
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
            Ikigori<Text style={styles.appNameAccent}>Smart</Text>
          </Text>

          {/* Tagline */}
          <Text style={[styles.tagline, { color: theme.colors.textPrimary }]}>
            {t('welcome.tagline')}
          </Text>

          {/* Description - larger font */}
          <Text
            style={[styles.description, { color: theme.colors.textSecondary }]}
          >
            {t('welcome.shortDescription')}
          </Text>

          {/* Buttons - less margin above, less space between */}
          <View style={styles.buttonContainer}>
            <PrimaryButton title={t('auth.login')} onPress={handleLogin} />
            <View style={{ height: spacing.xs }} />
            <OutlineButton
              title={t('auth.register')}
              onPress={handleRegister}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    height: IMAGE_SECTION_HEIGHT,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
  },
  topBarSpacer: {
    flex: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  langEmoji: {
    fontSize: 14,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
  },
  heroSection: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  imageCard: {
    position: 'absolute',
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  imageLeft: {
    left: width * 0.01,
    top: '13%',
    transform: [{ rotate: '-6deg' }],
    zIndex: 1,
  },
  imageCenter: {
    alignSelf: 'center',
    top: '2%',
    transform: [{ rotate: '0deg' }],
    zIndex: 3,
  },
  imageRight: {
    right: width * 0.01,
    top: '15%',
    transform: [{ rotate: '6deg' }],
    zIndex: 2,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: -28,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoCircleWrapper: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  appNameAccent: {
    fontWeight: '300',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.md,
    paddingBottom: spacing.sm,
  },
});
