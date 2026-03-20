import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { spacing } from '../theme/spacing';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItemProps {
  question: string;
  answer: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isExpanded, onToggle }) => {
  const { theme } = useTheme();

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={[styles.item, { backgroundColor: theme.colors.surfaceMain }]}>
      <TouchableOpacity style={styles.header} onPress={handleToggle} activeOpacity={0.7}>
        <Ionicons
          name={isExpanded ? 'remove-circle' : 'add-circle'}
          size={22}
          color={theme.colors.brandMain}
          style={styles.headerIcon}
        />
        <Text style={[styles.question, { color: theme.colors.textPrimary }]}>{question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={theme.colors.iconsSecondary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <Text style={[styles.answer, { color: theme.colors.textSecondary }]}>{answer}</Text>
      )}
    </View>
  );
};

export const FAQ: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = [
    { question: t('faq.q1.question'), answer: t('faq.q1.answer') },
    { question: t('faq.q2.question'), answer: t('faq.q2.answer') },
    { question: t('faq.q3.question'), answer: t('faq.q3.answer') },
    { question: t('faq.q4.question'), answer: t('faq.q4.answer') },
    { question: t('faq.q5.question'), answer: t('faq.q5.answer') },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceHover }]}>
      <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('faq.title')}</Text>
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          isExpanded={expandedIndex === index}
          onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  item: {
    marginBottom: spacing.sm,
    borderRadius: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  headerIcon: {
    marginRight: spacing.sm,
  },
  question: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  answer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingLeft: 46,
    fontSize: 13,
    lineHeight: 20,
  },
});
