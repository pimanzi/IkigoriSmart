import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CameraScreen } from '../scan/CameraScreen';
import { DiagnosisScreen } from '../scan/DiagnosisScreen';
import { WeatherInputScreen } from '../scan/WeatherInputScreen';
import { WeatherPreviewScreen } from '../scan/WeatherPreviewScreen';
import { SpreadRiskScreen } from '../scan/SpreadRiskScreen';
import type { ScanStackParamList } from '../../types';

const Stack = createStackNavigator<ScanStackParamList>();

export const ScanScreen: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CameraScreen" component={CameraScreen} />
      <Stack.Screen name="DiagnosisScreen" component={DiagnosisScreen} />
      <Stack.Screen name="WeatherInputScreen" component={WeatherInputScreen} />
      <Stack.Screen name="WeatherPreviewScreen" component={WeatherPreviewScreen} />
      <Stack.Screen name="SpreadRisk" component={SpreadRiskScreen} />
    </Stack.Navigator>
  );
};
