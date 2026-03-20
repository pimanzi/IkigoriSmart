import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { HomeScreen } from '../screens/farmer/HomeScreen';
import { ScanScreen } from '../screens/farmer/ScanScreen';
import { AlertsScreen } from '../screens/alerts/AlertsScreen';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { VoiceFAB } from '../components/voice/VoiceFAB';
import { VoiceModeOverlay } from '../components/voice/VoiceModeOverlay';
import { useVoiceCommands, VoiceCommandKeyword } from '../hooks/useVoiceCommands';
import { useScanProgress } from '../contexts/ScanProgressContext';
import type { FarmerTabParamList } from '../types';

const Tab = createBottomTabNavigator<FarmerTabParamList>();

// Tab bar height used for positioning the FAB above it
const TAB_BAR_HEIGHT = 68;

export const FarmerBottomTabNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Ref to the tab navigator's own navigation object (set via screenListeners)
  const tabNavRef = useRef<any>(null);

  const {
    step,
    imageUri,
    severity,
    district,
    temperature,
    humidity,
    rainfall,
    weatherSource,
    spreadRiskResponse,
    resetScan,
    setPendingVoiceAction,
  } = useScanProgress();

  const handleVoiceCommand = useCallback(
    (keyword: VoiceCommandKeyword) => {
      setOverlayVisible(false);

      const nav = tabNavRef.current;
      if (!nav) return;

      // On Alerts/Profile tabs restrict to navigation-only commands
      if (activeTabIndex >= 2 && keyword !== 'home' && keyword !== 'stop') {
        return;
      }

      switch (keyword) {
        case 'camera':
          nav.navigate('Scan', {
            screen: 'CameraScreen',
            params: { voiceAction: 'camera', voiceTs: Date.now() },
          });
          break;

        case 'gallery':
          nav.navigate('Scan', {
            screen: 'CameraScreen',
            params: { voiceAction: 'gallery', voiceTs: Date.now() },
          });
          break;

        case 'predict':
          if (imageUri) {
            nav.navigate('Scan', {
              screen: 'CameraScreen',
              params: { voiceAction: 'predict', voiceImageUri: imageUri, voiceTs: Date.now() },
            });
          }
          break;

        case 'one':
        case 'second': {
          const districtName = keyword === 'one' ? 'Musanze' : 'Nyabihu';
          if (severity && imageUri) {
            // voiceAutoRisk=true → WeatherInputScreen auto-fetches weather and
            // auto-navigates to WeatherPreviewScreen (stops there, waits for "risk")
            nav.navigate('Scan', {
              screen: 'WeatherInputScreen',
              params: { severity, imageUri, voiceDistrict: districtName, voiceAutoRisk: true },
            });
          } else {
            nav.navigate('Scan', { screen: 'CameraScreen', params: {} });
          }
          break;
        }

        case 'risk':
          // Signal WeatherPreviewScreen to run prediction via context (avoids stale params)
          setPendingVoiceAction('risk');
          break;

        case 'save':
          // Signal SpreadRiskScreen to save via context
          setPendingVoiceAction('save');
          break;

        case 'feedback':
          // Signal SpreadRiskScreen to submit feedback via context
          setPendingVoiceAction('feedback');
          break;

        case 'home':
          nav.navigate('Home');
          break;

        case 'stop':
          break;
      }
    },
    [activeTabIndex, imageUri, severity, district, temperature, humidity, rainfall, weatherSource, spreadRiskResponse, setPendingVoiceAction],
  );

  const { isListening, statusMessage, availableCommands, startListening, stopListening } =
    useVoiceCommands(step, handleVoiceCommand, () => {
      // Auto-close silently after 10 seconds with no command
      setOverlayVisible(false);
    });

  // On Alerts/Profile tabs restrict to home & stop; otherwise only show enabled commands
  const displayCommands =
    activeTabIndex >= 2
      ? availableCommands.filter(cmd => cmd.keyword === 'home' || cmd.keyword === 'stop')
      : availableCommands.filter(cmd => cmd.enabled);

  const handleFABPress = async () => {
    if (overlayVisible) {
      await stopListening();
      setOverlayVisible(false);
    } else {
      setOverlayVisible(true);
      await startListening();
    }
  };

  const handleClose = async () => {
    await stopListening();
    setOverlayVisible(false);
  };

  return (
    <View style={styles.root}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.colors.iconsPrimary,
          tabBarInactiveTintColor: theme.colors.iconsSecondary,
          tabBarStyle: overlayVisible
            ? { display: 'none' }
            : {
                backgroundColor: theme.colors.surfaceMain,
                borderTopColor: theme.colors.surfaceHover,
                borderTopWidth: 1,
                paddingBottom: 8,
                paddingTop: 8,
                height: TAB_BAR_HEIGHT,
                elevation: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 12,
              },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 4,
          },
        }}
        screenListeners={({ navigation: tabNav, route }) => ({
          focus: () => {
            tabNavRef.current = tabNav;
            const state = tabNav.getState();
            if (state) setActiveTabIndex(state.index);
            // Reset scan state when Home tab comes into focus so commands refresh
            if (route.name === 'Home') resetScan();
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('navigation.home'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Scan"
          component={ScanScreen}
          options={{
            tabBarLabel: t('navigation.scan'),
            tabBarIcon: ({ color, focused }) => (
              <View style={[styles.scanBtn, focused && styles.scanBtnActive]}>
                <Ionicons name="scan" size={26} color={focused ? '#ffffff' : color} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Alerts"
          component={AlertsScreen}
          options={{
            tabBarLabel: t('navigation.alerts'),
            tabBarIcon: ({ color, size }) => (
              <View>
                <Ionicons name="notifications-outline" size={size} color={color} />
              </View>
            ),
            tabBarBadge: 3,
            tabBarBadgeStyle: {
              backgroundColor: theme.colors.errorMain,
              color: '#ffffff',
              fontSize: 10,
              fontWeight: '700',
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              lineHeight: 18,
            },
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStackNavigator}
          options={{
            tabBarLabel: t('navigation.profile'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>

      <VoiceFAB
        isListening={isListening}
        onPress={handleFABPress}
        bottomOffset={TAB_BAR_HEIGHT}
      />
      <VoiceModeOverlay
        visible={overlayVisible}
        isListening={isListening}
        statusMessage={statusMessage}
        availableCommands={displayCommands}
        onClose={handleClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scanBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6f6f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanBtnActive: {
    backgroundColor: '#04966a',
  },
});
