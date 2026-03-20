export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  district?: string;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Profile Update Types ────────────────────────────────────────────────────

export interface ProfileUpdatePayload {
  first_name:   string;
  last_name:    string;
  phone_number: number;
  district:     'Musanze' | 'Nyabihu';
}

export interface PasswordUpdatePayload {
  newPassword:     string;
  confirmPassword: string;
}

export interface AvatarUploadInput {
  imageUri: string;
  authId:   string;
}

export interface Tutorial {
  id:           string;
  title:        string;
  description:  string;
  type:         'video' | 'reading';
  topic:        'scan' | 'mln' | 'ipm' | 'weather';
  duration:     string;
  content_url:  string | null;
  created_at:   string;
}

export interface SavedTutorial {
  id:               string;
  user_id:          string;
  tutorial_id:      string;
  progress_percent: number;
  saved_at:         string;
  last_accessed:    string | null;
  tutorial: {
    id:          string;
    title:       string;
    description: string;
    type:        'video' | 'reading';
    topic:       'scan' | 'mln' | 'ipm' | 'weather';
    duration:    string;
    content_url: string | null;
    created_at:  string;
  };
}

export interface SaveTutorialPayload {
  profileId:   string;
  tutorialId:  string;
}

export interface UpdateProgressPayload {
  saved_tutorial_id: string;
  progress_percent:  number;
}

export interface TutorialNote {
  id:          string;
  user_id:     string;
  tutorial_id: string;
  content:     string;
  created_at:  string;
  updated_at:  string;
}

export interface AddNotePayload {
  user_id:     string;
  tutorial_id: string;
  content:     string;
}

// ─── MLN Severity Prediction (CNN model) ────────────────────────────────────

export interface ClassProbability {
  label: string;
  probability: number;
}

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  probabilities: ClassProbability[];
  severity_level: number;
  inference_time_ms: number;
}

// ─── Spread Risk Prediction (weather-risk model) ─────────────────────────────

export interface SpreadRiskRequest {
  severity: string;    // 'Healthy' | 'Early' | 'Moderate' | 'Severe'
  temperature: number;
  humidity: number;
  rainfall: number;
  district: string;    // 'Musanze' | 'Nyabihu'
}

export interface RiskProbability {
  label: string;
  probability: number;
}

export interface ScoreBreakdown {
  severity_score: number;
  temperature_score: number;
  humidity_score: number;
  rainfall_score: number;
  total_score: number;
  max_possible: number;
}

export interface SpreadRiskResponse {
  risk_level: string;           // 'Low' | 'Medium' | 'High'
  confidence: number;
  probabilities: RiskProbability[];
  score_breakdown: ScoreBreakdown;
  risk_level_int: number;       // 0=Low  1=Medium  2=High
  inference_time_ms: number;
  model_version: string;
}

// ─── Supabase records ────────────────────────────────────────────────────────

export interface IPMRecommendation {
  id: string;
  severity: string;
  risk_level: string;
  title_en: string;
  title_rw: string;
  description_en: string;
  description_rw: string;
  action_type: 'immediate' | 'monitor' | 'preventive';
  created_at: string;
}

export interface SavedPrediction {
  id:             string;
  user_id:        string;
  image_url:      string;
  severity:       string;   // 'Healthy' | 'Early' | 'Moderate' | 'Severe'
  temperature_c:  number;
  humidity_pct:   number;
  rainfall_mm:    number;
  district:       string;   // 'Musanze' | 'Nyabihu'
  risk_level:     string;   // 'Low' | 'Medium' | 'High'
  weather_source: string;   // 'api' | 'manual'
  created_at:     string;
}

export interface FeedbackPayload {
  prediction_id: string;
  user_id: string;
  comment: string;
  rating: number;     // 1–5
}

export interface PredictionPayload {
  user_id: string;
  image_url: string;
  severity: string;
  temperature_c: number;
  humidity_pct: number;
  rainfall_mm: number;
  district: string;
  risk_level: string;
  weather_source: string;  // 'api' | 'manual'
}

export interface AlertRecord {
  id:          string;
  admin_id:    string;
  title_en:    string;
  title_rw:    string;
  message_en:  string;
  message_rw:  string;
  risk_level:  'Low' | 'Medium' | 'High';
  district:    string;
  is_active:   boolean;
  created_at:  string;
}

// Auth Stack (Welcome, Login, Register)
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
};

// Root Stack (combines Auth + Main)
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type FarmerTabParamList = {
  Home: undefined;
  Scan: undefined;
  Alerts: undefined;
  Profile: undefined;
  SavedTutorialDetail: {
    savedTutorial: SavedTutorial;
  };
  TutorialDetail: {
    tutorial: Tutorial;
  };
};

export type ScanStackParamList = {
  CameraScreen: {
    voiceAction?: 'camera' | 'gallery' | 'predict';
    voiceImageUri?: string;
    voiceTs?: number;
  };
  DiagnosisScreen: {
    predictionResponse: PredictionResponse;
    imageUri: string;
  };
  WeatherInputScreen: {
    severity: string;
    imageUri: string;
    voiceDistrict?: 'Musanze' | 'Nyabihu';
    voiceAutoRisk?: boolean;
  };
  WeatherPreviewScreen: {
    severity: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    district: string;
    weatherSource: 'api' | 'manual';
    imageUri: string;
    voiceAutoRisk?: boolean;
  };
  SpreadRisk: {
    spreadRiskResponse: SpreadRiskResponse;
    severity: string;
    temperature: number;
    humidity: number;
    rainfall: number;
    district: string;
    weatherSource: 'api' | 'manual';
    imageUri: string;
  };
};
