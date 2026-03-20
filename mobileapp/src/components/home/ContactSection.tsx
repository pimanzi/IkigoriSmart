import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

export interface ContactOption {
  id: string;
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  action: 'email' | 'phone' | 'social';
  deepLink: string;
}

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const contactOptions: ContactOption[] = [
    {
      id: '1',
      label: t('contact.emailLabel'),
      value: t('contact.emailValue'),
      icon: 'mail',
      backgroundColor: theme.colors.infoHover,
      iconColor: theme.colors.infoMain,
      action: 'email',
      deepLink: 'mailto:support@ikigori.rw',
    },
    {
      id: '2',
      label: t('contact.callLabel'),
      value: t('contact.callValue'),
      icon: 'call',
      backgroundColor: theme.colors.successHover,
      iconColor: theme.colors.successMain,
      action: 'phone',
      deepLink: 'tel:+250788123456',
    },
    {
      id: '3',
      label: t('contact.socialLabel'),
      value: t('contact.socialValue'),
      icon: 'logo-twitter',
      backgroundColor: theme.colors.secondaryHover,
      iconColor: theme.colors.secondaryMain,
      action: 'social',
      deepLink: 'https://twitter.com/IkigoriSmart',
    },
  ];

  const handlePress = async (deepLink: string) => {
    try {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        Alert.alert(
          t('contact.errorTitle'),
          t('contact.errorMessage')
        );
      }
    } catch (error) {
      Alert.alert(
        t('contact.errorTitle'),
        t('contact.errorMessage')
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <View style={[styles.divider, { backgroundColor: theme.colors.iconsMuted }]} />
      
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
        {t('contact.title')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('contact.subtitle')}
      </Text>

      <View style={styles.buttonsRow}>
        {contactOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.buttonWrapper}
            onPress={() => handlePress(option.deepLink)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.circle,
                { backgroundColor: option.backgroundColor },
                styles.shadow,
              ]}
            >
              <Ionicons name={option.icon} size={28} color={option.iconColor} />
            </View>
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.copyright, { color: theme.colors.iconsMuted }]}>
        {t('contact.copyright')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  divider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 24,
    marginBottom: spacing.lg,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
  copyright: {
    fontSize: 11,
    textAlign: 'center',
  },
});
