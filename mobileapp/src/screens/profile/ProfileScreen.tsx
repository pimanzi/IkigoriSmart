import React, { useState } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../theme/ThemeContext';
import { ProfileTabBar } from '../../components/profile/ProfileTabBar';
import { ProfileTab } from '../../components/profile/ProfileTab';
import { TutorialsTab } from '../../components/profile/TutorialsTab';
import { MyLearningTab } from '../../components/profile/MyLearningTab';
import { SavedPredictionsTab } from '../../components/profile/SavedPredictionsTab';
import { useLogout } from '../../hooks/useLogout';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { mutate: logout } = useLogout();
  const { data: user } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'tutorials' | 'mylearning' | 'predictions'>('profile');
  const [tutorialTypeFilter, setTutorialTypeFilter] = useState<'all' | 'video' | 'reading'>('all');

  const userProfile = {
    firstName: user?.profile?.first_name || '',
    lastName: user?.profile?.last_name || '',
    email: user?.email || '',
    phoneNumber: user?.profile?.phone_number != null ? String(user.profile.phone_number) : '',
    district: (user?.profile?.district || 'Musanze') as import('../../types/profileTypes').District,
    avatarUrl: user?.profile?.avatar ?? undefined,
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: t('profile.logoutSuccess'),
        });
      },
      onError: () => {
        Toast.show({
          type: 'error',
          text1: t('profile.logoutError'),
        });
      },
    });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab userProfile={userProfile} onLogout={handleLogout} />;
      case 'tutorials':
        return (
          <TutorialsTab
            typeFilter={tutorialTypeFilter}
            onTypeFilterChange={setTutorialTypeFilter}
          />
        );
      case 'mylearning':
        return <MyLearningTab onSwitchToTutorials={() => setActiveTab('tutorials')} />;
      case 'predictions':
        return <SavedPredictionsTab />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme.colors.surfaceMain === '#ffffff' ? 'dark-content' : 'light-content'} />
      <ProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
