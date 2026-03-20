import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';

interface AlertSortDropdownProps {
  sortOrder: 'newest' | 'oldest';
  onSortChange: (order: 'newest' | 'oldest') => void;
  totalShowing: number;
}

export const AlertSortDropdown: React.FC<AlertSortDropdownProps> = ({
  sortOrder,
  onSortChange,
  totalShowing,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSortSelect = (order: 'newest' | 'oldest') => {
    onSortChange(order);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={[styles.showingText, { color: theme.colors.textSecondary }]}>
          {t('alerts.showing', { count: totalShowing })}
        </Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="funnel" size={16} color={theme.colors.textSecondary} />
          <Text style={[styles.sortText, { color: theme.colors.textSecondary }]}>
            {sortOrder === 'newest' ? t('alerts.newestFirst') : t('alerts.oldestFirst')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[styles.modalCard, { backgroundColor: theme.colors.surfaceMain }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                {t('alerts.sortBy')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSortSelect('newest')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="time"
                  size={20}
                  color={
                    sortOrder === 'newest' ? theme.colors.brandMain : theme.colors.iconsSecondary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        sortOrder === 'newest' ? theme.colors.brandMain : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {t('alerts.newestFirst')}
                </Text>
              </View>
              {sortOrder === 'newest' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.brandMain} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => handleSortSelect('oldest')}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={
                    sortOrder === 'oldest' ? theme.colors.brandMain : theme.colors.iconsSecondary
                  }
                />
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        sortOrder === 'oldest' ? theme.colors.brandMain : theme.colors.textPrimary,
                    },
                  ]}
                >
                  {t('alerts.oldestFirst')}
                </Text>
              </View>
              {sortOrder === 'oldest' && (
                <Ionicons name="checkmark" size={20} color={theme.colors.brandMain} />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  showingText: {
    fontSize: 13,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
