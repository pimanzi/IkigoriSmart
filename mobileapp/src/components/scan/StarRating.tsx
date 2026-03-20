import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/spacing';

interface StarRatingProps {
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ onRatingChange }) => {
  const { theme } = useTheme();
  const [rating, setRating] = useState(0);

  const handlePress = (index: number) => {
    setRating(index + 1);
    onRatingChange?.(index + 1);
  };

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <TouchableOpacity key={index} onPress={() => handlePress(index)}>
          <Ionicons
            name={index < rating ? 'star' : 'star-outline'}
            size={32}
            color={index < rating ? theme.colors.brandMain : theme.colors.iconsMuted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
});

export default StarRating;
