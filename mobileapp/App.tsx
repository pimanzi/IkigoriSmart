import 'react-native-gesture-handler';
import { decode, encode } from 'base-64';

if (typeof atob === 'undefined') {
  global.atob = decode;
}
if (typeof btoa === 'undefined') {
  global.btoa = encode;
}

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AuthStackNavigator } from './src/navigation/AuthStackNavigator';
import { toastConfig } from './src/config/toastConfig';
import { ScanProgressProvider } from './src/contexts/ScanProgressContext';
import './src/i18n';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ScanProgressProvider>
            <NavigationContainer>
              <AuthStackNavigator />
              <StatusBar style="auto" />
            </NavigationContainer>
            <Toast config={toastConfig} />
          </ScanProgressProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
