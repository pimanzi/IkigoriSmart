import { useState, useEffect, useRef, useCallback } from 'react';
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';
import { ScanStep } from '../contexts/ScanProgressContext';

export interface VoiceCommand {
  keyword: string;
  icon: string;        // Ionicons glyph name
  description: string;
  enabled: boolean;
}

export type VoiceCommandKeyword =
  | 'camera'
  | 'gallery'
  | 'predict'
  | 'one'       // Musanze district
  | 'second'    // Nyabihu district
  | 'risk'      // Run spread risk prediction on WeatherPreviewScreen
  | 'save'      // Save prediction on SpreadRiskScreen
  | 'feedback'  // Submit feedback (rating + comment) on SpreadRiskScreen
  | 'home'
  | 'stop';

const ALL_COMMANDS: Omit<VoiceCommand, 'enabled'>[] = [
  { keyword: 'camera',   icon: 'camera-outline',               description: 'Take a photo with your camera'       },
  { keyword: 'gallery',  icon: 'images-outline',               description: 'Pick a photo from your gallery'      },
  { keyword: 'predict',  icon: 'flask-outline',                description: 'Predict the disease severity'        },
  { keyword: 'one',      icon: 'location-outline',             description: 'Musanze — fetches weather & preview' },
  { keyword: 'second',   icon: 'location-outline',             description: 'Nyabihu — fetches weather & preview' },
  { keyword: 'risk',     icon: 'hardware-chip-outline',        description: 'Run the spread risk prediction'      },
  { keyword: 'save',     icon: 'bookmark-outline',             description: 'Save this prediction to history'     },
  { keyword: 'feedback', icon: 'chatbubble-ellipses-outline',  description: 'Submit your rating and comment'      },
  { keyword: 'home',     icon: 'home-outline',                 description: 'Go back to Home screen'              },
  { keyword: 'stop',     icon: 'stop-circle-outline',          description: 'Exit voice mode'                     },
];

// Commands available at each scan step
const ENABLED_BY_STEP: Record<ScanStep, VoiceCommandKeyword[]> = {
  // Home tab — no active scan
  idle:               ['camera', 'gallery', 'stop'],
  // Image selected in CameraScreen
  image_selected:     ['camera', 'gallery', 'predict', 'home', 'stop'],
  // CNN prediction done — DiagnosisScreen / WeatherInputScreen
  severity_predicted: ['camera', 'gallery', 'one', 'second', 'home', 'stop'],
  // Weather data fetched — WeatherPreviewScreen waiting for risk command
  weather_previewed:  ['camera', 'gallery', 'risk', 'home', 'stop'],
  // Spread risk done — SpreadRiskScreen
  risk_predicted:     ['save', 'feedback', 'home', 'stop'],
};

export type StatusMessage = {
  type: 'listening' | 'recognized' | 'error' | 'disabled' | 'idle';
  text: string;
};

export interface UseVoiceCommandsReturn {
  isListening: boolean;
  statusMessage: StatusMessage;
  recognizedCommand: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  availableCommands: VoiceCommand[];
}

export function useVoiceCommands(
  step: ScanStep,
  onCommand: (keyword: VoiceCommandKeyword) => void,
  onAutoClose: () => void,
): UseVoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>({
    type: 'idle',
    text: 'Say a command below',
  });
  const [recognizedCommand, setRecognizedCommand] = useState('');

  const timeoutRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const executingRef   = useRef(false);
  const stepRef        = useRef(step);
  const onCommandRef   = useRef(onCommand);
  const onAutoCloseRef = useRef(onAutoClose);

  stepRef.current        = step;
  onCommandRef.current   = onCommand;
  onAutoCloseRef.current = onAutoClose;

  const availableCommands: VoiceCommand[] = ALL_COMMANDS.map(cmd => ({
    ...cmd,
    enabled: ENABLED_BY_STEP[step].includes(cmd.keyword as VoiceCommandKeyword),
  }));

  const clearAutoTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const stopListening = useCallback(async () => {
    clearAutoTimeout();
    executingRef.current = false;
    try {
      await Voice.stop();
      await Voice.destroy();
    } catch (_) {}
    setIsListening(false);
    setStatusMessage({ type: 'idle', text: 'Say a command below' });
    setRecognizedCommand('');
  }, []);

  const startAutoTimeout = useCallback(() => {
    clearAutoTimeout();
    timeoutRef.current = setTimeout(async () => {
      await stopListening();
      onAutoCloseRef.current();
    }, 10000);
  }, [stopListening]);

  // Auto-close after showing an error/disabled message (1.5 s)
  const closeAfterError = useCallback(() => {
    clearAutoTimeout();
    timeoutRef.current = setTimeout(async () => {
      await stopListening();
      onAutoCloseRef.current();
    }, 1500);
  }, [stopListening]);

  const startListening = useCallback(async () => {
    executingRef.current = false;
    setRecognizedCommand('');
    setStatusMessage({ type: 'listening', text: 'Say a command below' });
    // Start the 10 s countdown immediately when overlay opens
    startAutoTimeout();
    try {
      await Voice.destroy();
      await Voice.start('en-US');
      setIsListening(true);
    } catch {
      clearAutoTimeout();
      setStatusMessage({
        type: 'error',
        text: 'Could not start microphone. Check permissions.',
      });
    }
  }, [startAutoTimeout]);

  useEffect(() => {
    const matchCommand = (results: string[]): VoiceCommandKeyword | null => {
      for (const result of results) {
        const lower = result.toLowerCase();
        for (const cmd of ALL_COMMANDS) {
          if (lower.includes(cmd.keyword.toLowerCase())) {
            return cmd.keyword as VoiceCommandKeyword;
          }
        }
      }
      return null;
    };

    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      if (executingRef.current) return;
      clearAutoTimeout();

      const results = e.value ?? [];
      const matched = matchCommand(results);

      if (!matched) {
        setStatusMessage({ type: 'error', text: 'Could not understand. Try again.' });
        closeAfterError();
        return;
      }

      const isEnabled = ENABLED_BY_STEP[stepRef.current].includes(matched);
      if (!isEnabled) {
        setStatusMessage({ type: 'disabled', text: 'Complete the previous step first.' });
        closeAfterError();
        return;
      }

      executingRef.current = true;
      setRecognizedCommand(matched);
      setStatusMessage({ type: 'recognized', text: `"${matched}" heard — running now...` });

      setTimeout(() => {
        onCommandRef.current(matched);
      }, 500);
    };

    Voice.onSpeechError = (_: SpeechErrorEvent) => {
      if (executingRef.current) return;
      setStatusMessage({ type: 'error', text: 'Could not understand. Try again.' });
      closeAfterError();
    };

    Voice.onSpeechPartialResults = () => {
      clearAutoTimeout();
    };

    return () => {
      Voice.removeAllListeners();
    };
  }, [startAutoTimeout, closeAfterError]);

  useEffect(() => {
    return () => {
      clearAutoTimeout();
      Voice.destroy().catch(() => {});
    };
  }, []);

  return {
    isListening,
    statusMessage,
    recognizedCommand,
    startListening,
    stopListening,
    availableCommands,
  };
}
