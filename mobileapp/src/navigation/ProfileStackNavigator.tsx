import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SavedTutorialDetailScreen } from '../screens/profile/SavedTutorialDetailScreen';
import { TutorialDetailScreen } from '../screens/profile/TutorialDetailScreen';
import type { FarmerTabParamList } from '../types';

const Stack = createStackNavigator<FarmerTabParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="SavedTutorialDetail" component={SavedTutorialDetailScreen} />
      <Stack.Screen name="TutorialDetail" component={TutorialDetailScreen} />
    </Stack.Navigator>
  );
};
