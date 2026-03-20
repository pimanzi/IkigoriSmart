import React from 'react';
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width } = Dimensions.get('window');

export interface ScanExample {
  id: string;
  level: 'healthy' | 'early' | 'moderate' | 'severe';
  badge: string;
  description: string;
  image: any;
  borderColor: string;
  badgeBackground: string;
  badgeText: string;
}

interface ScanCardProps {
  example: ScanExample;
}

export const ScanCard: React.FC<ScanCardProps> = ({ example }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceMain,
          borderColor: example.borderColor,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <Image source={example.image} style={styles.image} resizeMode="cover" />
        <View
          style={[
            styles.badge,
            {
              backgroundColor: example.badgeBackground,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: example.badgeText }]}>
            {example.badge}
          </Text>
        </View>
      </View>
      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {example.description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.8,
    borderRadius: 16,
    borderWidth: 2,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    padding: 12,
  },
});
