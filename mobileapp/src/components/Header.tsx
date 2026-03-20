import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLoggedIn = false,
  userName,
  onProfile,
}) => {
  const { i18n } = useTranslation();
  const { theme, themeMode, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'rw' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.brandMain, paddingTop: insets.top + spacing.md }]}>
      {/* Left: Logo + App Name */}
      <View style={styles.leftSection}>
        <View style={styles.logoCircle}>
          <Ionicons name="leaf" size={20} color="#04966a" />
        </View>
        <Text style={styles.appName}>
          Ikigori<Text style={styles.appNameAccent}>Smart</Text>
        </Text>
      </View>

      {/* Right: Theme toggle, Language toggle, Avatar */}
      <View style={styles.rightSection}>
        {/* Dark mode toggle */}
        <TouchableOpacity style={styles.iconBtn} onPress={toggleTheme} activeOpacity={0.7}>
          <Ionicons 
            name={themeMode === 'dark' ? 'sunny' : 'moon'} 
            size={20} 
            color="#ffffff" 
          />
        </TouchableOpacity>

        {/* Language toggle */}
        <TouchableOpacity style={styles.langPill} onPress={toggleLanguage} activeOpacity={0.7}>
          <Text style={styles.langEmoji}>{i18n.language === 'en' ? '🇬🇧' : '🇷🇼'}</Text>
          <Text style={styles.langText}>{i18n.language.toUpperCase()}</Text>
        </TouchableOpacity>

        {isLoggedIn && (
          <TouchableOpacity style={styles.avatar} onPress={onProfile}>
            <Text style={styles.avatarText}>{userName?.charAt(0) || 'U'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  appName: {
    fontSize: 21,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  appNameAccent: {
    fontWeight: '300',
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.82)',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },
  langEmoji: {
    fontSize: 13,
  },
  langText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#04966a',
  },
});
