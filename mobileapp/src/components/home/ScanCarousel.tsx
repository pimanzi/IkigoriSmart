import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';
import { ScanCard, ScanExample } from './ScanCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const CARD_MARGIN = 8;

const scanExamples: ScanExample[] = [
  {
    id: '1',
    level: 'healthy',
    badge: 'HEALTHY',
    description: 'Consistent green color, no chlorosis.',
    image: require('../../../assets/images/healthy.jpeg'),
    borderColor: '',
    badgeBackground: '',
    badgeText: '',
  },
  {
    id: '2',
    level: 'early',
    badge: 'EARLY',
    description: 'Initial yellow streaks and small chlorotic spots.',
    image: require('../../../assets/images/early.jpeg'),
    borderColor: '',
    badgeBackground: '',
    badgeText: '',
  },
  {
    id: '3',
    level: 'moderate',
    badge: 'MODERATE',
    description: 'Significant leaf drying and spreading yellow patches.',
    image: require('../../../assets/images/moderate.jpeg'),
    borderColor: '#f97316',
    badgeBackground: '#fff4ed',
    badgeText: '#c2410c',
  },
  {
    id: '4',
    level: 'severe',
    badge: 'SEVERE',
    description: 'Complete necrosis, leaf drying, and plant stuntedness.',
    image: require('../../../assets/images/severe.jpeg'),
    borderColor: '',
    badgeBackground: '',
    badgeText: '',
  },
];

export const ScanCarousel: React.FC = () => {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const dotAnimations = useRef(scanExamples.map(() => new Animated.Value(8))).current;

  // Set theme colors for examples
  const examples = scanExamples.map((ex) => {
    if (ex.level === 'healthy') {
      return {
        ...ex,
        borderColor: theme.colors.successMain,
        badgeBackground: theme.colors.successHover,
        badgeText: theme.colors.successMain,
      };
    }
    if (ex.level === 'early') {
      return {
        ...ex,
        borderColor: theme.colors.chart4,
        badgeBackground: theme.colors.chart4 + '20',
        badgeText: theme.colors.chart4,
      };
    }
    if (ex.level === 'severe') {
      return {
        ...ex,
        borderColor: theme.colors.errorMain,
        badgeBackground: theme.colors.errorHover,
        badgeText: theme.colors.errorMain,
      };
    }
    return ex;
  });

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (CARD_WIDTH + CARD_MARGIN * 2));
    if (index !== activeIndex) {
      setActiveIndex(index);
      animateDots(index);
    }
  };

  const animateDots = (index: number) => {
    dotAnimations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === index ? 24 : 8,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  };

  const handleArrow = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? activeIndex - 1 : activeIndex + 1;
    if (newIndex >= 0 && newIndex < examples.length) {
      scrollRef.current?.scrollTo({
        x: newIndex * (CARD_WIDTH + CARD_MARGIN * 2),
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.carouselWrapper}>
        {activeIndex > 0 && (
          <TouchableOpacity
            style={[styles.arrow, styles.leftArrow]}
            onPress={() => handleArrow('left')}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.brandMain} />
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
          snapToAlignment="center"
          contentContainerStyle={styles.scrollContent}
        >
          {examples.map((example) => (
            <ScanCard key={example.id} example={example} />
          ))}
        </ScrollView>

        {activeIndex < examples.length - 1 && (
          <TouchableOpacity
            style={[styles.arrow, styles.rightArrow]}
            onPress={() => handleArrow('right')}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-forward" size={24} color={theme.colors.brandMain} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.pagination}>
        {examples.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: dotAnimations[index],
                backgroundColor:
                  index === activeIndex ? theme.colors.brandMain : theme.colors.iconsMuted,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  carouselWrapper: {
    position: 'relative',
  },
  scrollContent: {
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftArrow: {
    left: 8,
  },
  rightArrow: {
    right: 8,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
