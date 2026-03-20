import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { uploadPredictionImage } from '../services/imageUpload.service';
import { savePrediction } from '../services/prediction.service';
import { PredictionPayload } from '../types';

export interface SavePredictionInput {
  imageUri: string;
  authId: string;    // auth.uid() — used for image upload filename (must match storage RLS)
  profileId: string; // public.profiles.id — used as user_id FK in predictions table
  severity: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  district: string;
  riskLevel: string;
  weatherSource: string;
}

export const useSavePrediction = () => {
  const { t } = useTranslation();

  const mutation = useMutation<string, Error, SavePredictionInput>({
    mutationFn: async (input) => {
      console.log('[useSavePrediction] Starting save with input:', {
        imageUri: input.imageUri.substring(0, 50) + '...',
        authId: input.authId,
        profileId: input.profileId,
        severity: input.severity,
      });

      try {
        console.log('[useSavePrediction] imageUri received:', input.imageUri);
        console.log('[useSavePrediction] imageUri type:', typeof input.imageUri);
        console.log('[useSavePrediction] Uploading image...');
        const imageUrl = await uploadPredictionImage(input.imageUri, input.authId);
        console.log('[useSavePrediction] Image uploaded:', imageUrl);

        const payload: PredictionPayload = {
          user_id: input.profileId,
          image_url: imageUrl,
          severity: input.severity,
          temperature_c: input.temperature,
          humidity_pct: input.humidity,
          rainfall_mm: input.rainfall,
          district: input.district,
          risk_level: input.riskLevel,
          weather_source: input.weatherSource,
        };

        console.log('[useSavePrediction] Saving prediction with payload:', payload);
        const predictionId = await savePrediction(payload);
        console.log('[useSavePrediction] Prediction saved with ID:', predictionId);
        return predictionId;
      } catch (error) {
        console.error('[useSavePrediction] Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('[useSavePrediction] Success callback triggered');
      Toast.show({
        type: 'success',
        text1: t('scan.history.saveSuccess'),
      });
    },
    onError: (error) => {
      console.error('[useSavePrediction] Error callback triggered:', error);
      Toast.show({
        type: 'error',
        text1: t('scan.history.saveError'),
        text2: error.message,
      });
    },
  });

  return {
    saveHistory: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
};
