import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, borderRadius } from '../../theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import { isValidImageUri } from '../../utils/imageValidation';
import TipsOverlay from '../../components/scan/TipsOverlay';
import ShutterButton from '../../components/scan/ShutterButton';
import { PredictionResponse } from '../../types';
import { useScanProgress } from '../../contexts/ScanProgressContext';

interface CameraScreenProps {
  navigation: any;
  route: {
    params?: {
      voiceAction?: 'camera' | 'gallery' | 'predict';
      voiceImageUri?: string;
      voiceTs?: number;
    };
  };
}

export const CameraScreen: React.FC<CameraScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { setImageSelected: markImageSelected } = useScanProgress();
  const [tipsVisible, setTipsVisible] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const autoPredictRef = useRef(false);

  const { voiceAction, voiceImageUri, voiceTs } = route?.params ?? {};

  // Voice action: re-runs whenever voiceTs changes (each new voice command gets a fresh timestamp)
  useEffect(() => {
    if (!voiceAction) return;
    const timer = setTimeout(() => {
      if (voiceAction === 'camera') {
        handleTakePhoto();
      } else if (voiceAction === 'gallery') {
        handlePickImage();
      } else if (voiceAction === 'predict') {
        if (selectedImage) {
          // Image already in state (e.g. picked from gallery) — predict directly
          handlePredict();
        } else if (voiceImageUri) {
          setSelectedImage(voiceImageUri);
          autoPredictRef.current = true;
        }
      }
    }, 350);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceTs]);

  // Trigger predict automatically after voice pre-load sets the image
  useEffect(() => {
    if (autoPredictRef.current && selectedImage) {
      autoPredictRef.current = false;
      handlePredict();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedImage]);

  const validateImage = (uri: string): boolean => {
    if (!isValidImageUri(uri)) {
      Toast.show({ type: 'error', text1: t('scan.validation.invalidFileType') });
      return false;
    }
    return true;
  };

  const callPredictionAPI = async (imageUri: string): Promise<PredictionResponse | null> => {
    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.jpg';
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      } as any);

      const apiUrl = process.env.EXPO_PUBLIC_SEVERITY_API_URL;
      console.log('API URL:', apiUrl);
      console.log('Calling API with image:', filename);
      
      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error('API request failed');
      }

      const data: PredictionResponse = await response.json();
      console.log('Prediction response:', data);
      return data;
    } catch (error) {
      console.error('API call error:', error);
      return null;
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: t('scan.validation.permissionRequired'),
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (validateImage(imageUri)) {
          setSelectedImage(imageUri);
          markImageSelected(imageUri);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('scan.api.networkError'),
      });
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: t('scan.validation.permissionRequired'),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (validateImage(imageUri)) {
          setSelectedImage(imageUri);
          markImageSelected(imageUri);
        }
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: t('scan.api.networkError'),
      });
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const predictionResponse = await callPredictionAPI(selectedImage);
    setLoading(false);

    if (!predictionResponse) {
      Toast.show({
        type: 'error',
        text1: t('scan.api.predictionFailed'),
      });
      return;
    }

    navigation.navigate('DiagnosisScreen', { 
      predictionResponse,
      imageUri: selectedImage 
    });
  };



  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.surfaceMain }]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.brandMain} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          {t('scan.cameraTitle')}
        </Text>
        <TouchableOpacity
          onPress={() => setTipsVisible(true)}
          style={styles.tipsBtn}
        >
          <Ionicons name="bulb" size={22} color={theme.colors.brandMain} />
        </TouchableOpacity>
      </View>

      {/* Viewfinder */}
      <View style={styles.viewfinderWrapper}>
        <View
          style={[styles.viewfinder, { borderColor: theme.colors.brandMain, backgroundColor: theme.colors.surfaceHover }]}
        >
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="camera" size={32} color={theme.colors.iconsMuted} />
              <Text
                style={[
                  styles.viewfinderText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t('scan.positionLeaf')}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Predict Button */}
      {selectedImage && (
        <TouchableOpacity
          style={[styles.predictBtn, { backgroundColor: theme.colors.brandMain }]}
          onPress={handlePredict}
          activeOpacity={0.8}
        >
          <Text style={styles.predictText}>{t('scan.predictButton')}</Text>
        </TouchableOpacity>
      )}

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surfaceMain }]}>
        <TouchableOpacity onPress={handlePickImage}>
          <Ionicons name="images" size={28} color={theme.colors.iconsSecondary} />
        </TouchableOpacity>
        <ShutterButton onPress={handleTakePhoto} />
        <TouchableOpacity onPress={() => setFlashActive(!flashActive)}>
          <Ionicons
            name="flash"
            size={28}
            color={
              flashActive ? theme.colors.brandMain : theme.colors.iconsSecondary
            }
          />
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.brandMain} />
          <Text style={[styles.loadingText, { color: '#fff' }]}>
            {t('scan.api.analyzing')}
          </Text>
        </View>
      )}

      {/* Tips Overlay */}
      <TipsOverlay
        visible={tipsVisible}
        onClose={() => setTipsVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  tipsBtn: {
    padding: spacing.xs,
  },
  viewfinderWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  viewfinder: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 320,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  predictBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  predictText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  viewfinderText: {
    marginTop: spacing.md,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CameraScreen;
