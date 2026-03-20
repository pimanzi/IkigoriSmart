import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { Hero } from '../../components/Hero';
import { Objectives } from '../../components/Objectives';
import { ScanExamplesSection } from '../../components/home/ScanExamplesSection';
import { TargetAudience } from '../../components/TargetAudience';
import { HowItWorks } from '../../components/HowItWorks';
import { FAQ } from '../../components/FAQ';
import { ContactSection } from '../../components/home/ContactSection';

export const HomeScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}>
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={styles.scrollContent}
        >
          <Header isLoggedIn={false} />
          <Hero
            isLoggedIn={false}
            onStartScanning={() => console.log('Navigate to Scan')}
          />
          <Objectives />
          <ScanExamplesSection />
          <TargetAudience />
          <HowItWorks />
          <FAQ />
          <ContactSection />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
});
