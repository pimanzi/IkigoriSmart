import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme/spacing';
import { typography } from '../theme/typography';

const { width } = Dimensions.get('window');
const heroImage = require('../../assets/images/hero.png');

interface HeroProps {
  isLoggedIn?: boolean;
  onStartScanning?: () => void;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  isLoggedIn = false,
  onStartScanning,
}) => {
  const { t } = useTranslation();

  return (
    <ImageBackground source={heroImage} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={['rgba(4,150,106,0.45)', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{t('hero.title')}</Text>
          <Text style={styles.mission}>{t('hero.mission')}</Text>

          <TouchableOpacity style={styles.ctaButton} onPress={onStartScanning} activeOpacity={0.8}>
            <Ionicons name="scan" size={20} color="#ffffff" />
            <Text style={styles.ctaText}>{t('hero.ctaButton')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    width: width,
    height: 380,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {},
  title: {
    fontSize: 28,
    lineHeight: 36,
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  mission: {
    fontSize: 17,
    lineHeight: 26,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#04966a',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 50,
    gap: 8,
    shadowColor: '#04966a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
