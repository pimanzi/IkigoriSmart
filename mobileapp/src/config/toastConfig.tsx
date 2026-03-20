import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BaseToastProps } from 'react-native-toast-message';

export const toastConfig = {
  success: ({ text1 }: BaseToastProps) => (
    <View style={styles.successContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
      </View>
      <Text style={styles.successText} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  ),
  error: ({ text1 }: BaseToastProps) => (
    <View style={styles.errorContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </View>
      <Text style={styles.errorText} numberOfLines={2}>
        {text1}
      </Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  successContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
});
