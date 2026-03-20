import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PredictionResponse, SpreadRiskResponse } from '../types';

export type ScanStep = 'idle' | 'image_selected' | 'severity_predicted' | 'weather_previewed' | 'risk_predicted';
export type PendingVoiceAction = 'risk' | 'save' | 'feedback' | null;

interface ScanProgressState {
  step: ScanStep;
  imageUri: string | null;
  predictionResponse: PredictionResponse | null;
  severity: string | null;
  spreadRiskResponse: SpreadRiskResponse | null;
  district: string | null;
  temperature: number | null;
  humidity: number | null;
  rainfall: number | null;
  weatherSource: 'api' | 'manual' | null;
  pendingVoiceAction: PendingVoiceAction;
}

interface ScanProgressContextType extends ScanProgressState {
  setImageSelected: (imageUri: string) => void;
  setSeverityPredicted: (
    prediction: PredictionResponse,
    imageUri: string,
    severity: string,
  ) => void;
  setWeatherPreviewed: () => void;
  setRiskPredicted: (
    risk: SpreadRiskResponse,
    severity: string,
    district: string,
    temperature: number,
    humidity: number,
    rainfall: number,
    weatherSource: 'api' | 'manual',
    imageUri: string,
  ) => void;
  setPendingVoiceAction: (action: PendingVoiceAction) => void;
  resetScan: () => void;
}

const initialState: ScanProgressState = {
  step: 'idle',
  imageUri: null,
  predictionResponse: null,
  severity: null,
  spreadRiskResponse: null,
  district: null,
  temperature: null,
  humidity: null,
  rainfall: null,
  weatherSource: null,
  pendingVoiceAction: null,
};

const ScanProgressContext = createContext<ScanProgressContextType | undefined>(undefined);

export const ScanProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ScanProgressState>(initialState);

  const setImageSelected = (imageUri: string) =>
    setState(prev => ({ ...prev, step: 'image_selected', imageUri }));

  const setSeverityPredicted = (
    prediction: PredictionResponse,
    imageUri: string,
    severity: string,
  ) =>
    setState(prev => ({
      ...prev,
      step: 'severity_predicted',
      predictionResponse: prediction,
      imageUri,
      severity,
    }));

  const setWeatherPreviewed = () =>
    setState(prev => ({ ...prev, step: 'weather_previewed' }));

  const setRiskPredicted = (
    risk: SpreadRiskResponse,
    severity: string,
    district: string,
    temperature: number,
    humidity: number,
    rainfall: number,
    weatherSource: 'api' | 'manual',
    imageUri: string,
  ) =>
    setState(prev => ({
      ...prev,
      step: 'risk_predicted',
      spreadRiskResponse: risk,
      severity,
      district,
      temperature,
      humidity,
      rainfall,
      weatherSource,
      imageUri,
    }));

  const setPendingVoiceAction = (action: PendingVoiceAction) =>
    setState(prev => ({ ...prev, pendingVoiceAction: action }));

  const resetScan = () => setState(initialState);

  return (
    <ScanProgressContext.Provider
      value={{
        ...state,
        setImageSelected,
        setSeverityPredicted,
        setWeatherPreviewed,
        setRiskPredicted,
        setPendingVoiceAction,
        resetScan,
      }}
    >
      {children}
    </ScanProgressContext.Provider>
  );
};

export const useScanProgress = (): ScanProgressContextType => {
  const ctx = useContext(ScanProgressContext);
  if (!ctx) throw new Error('useScanProgress must be used within ScanProgressProvider');
  return ctx;
};
