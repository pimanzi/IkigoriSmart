// public.profiles
export interface Profile {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  district: 'Musanze' | 'Nyabihu';
  role: 'Admin' | 'Farmer';
  position: string | null;
  created_at: string;
  updated_at: string;
  avatar: string | null;
}

// Auth context type
export interface AuthContextType {
  session: any | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// public.predictions
export interface Prediction {
  id: string;
  user_id: string;
  image_url: string;
  severity: 'Healthy' | 'Early' | 'Moderate' | 'Severe';
  temperature_c: number;
  humidity_pct: number;
  rainfall_mm: number;
  district: 'Musanze' | 'Nyabihu';
  risk_level: 'Low' | 'Medium' | 'High';
  weather_source: 'api' | 'manual';
  created_at: string;
  profile?: Profile;
}

// public.ipm_recommendations
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

// public.tutorials
export interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'reading';
  topic: 'scan' | 'mln' | 'ipm' | 'weather';
  duration: string;
  content_url: string | null;
  created_at: string;
}

// public.feedback
export interface Feedback {
  id: string;
  prediction_id: string;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
  prediction?: Prediction;
  profile?: Profile;
}

// public.alerts
export interface Alert {
  id: string;
  admin_id: string;
  title_en: string;
  title_rw: string;
  message_en: string;
  message_rw: string;
  risk_level: 'Low' | 'Medium' | 'High';
  district: 'Musanze' | 'Nyabihu' | 'All';
  is_active: boolean;
  created_at: string;
  profile?: Profile;
}

// Dashboard recent activity entry types
export type RecentIPMEntry = Pick<IPMRecommendation, 'id' | 'title_en' | 'action_type' | 'severity' | 'risk_level' | 'created_at'>;
export type RecentTutorialEntry = Pick<Tutorial, 'id' | 'title' | 'type' | 'topic' | 'duration' | 'created_at'>;

export interface RecentPredictionEntry {
  id: string;
  severity: 'Healthy' | 'Early' | 'Moderate' | 'Severe';
  risk_level: 'Low' | 'Medium' | 'High';
  district: 'Musanze' | 'Nyabihu';
  image_url: string;
  created_at: string;
  user_id: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
    district: 'Musanze' | 'Nyabihu';
  };
}

export interface RecentFeedbackEntry {
  id: string;
  comment: string;
  rating: number;
  created_at: string;
  user_id: string;
  prediction_id: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar: string | null;
  };
  prediction?: {
    id: string;
    severity: string;
    risk_level: string;
    district: string;
    image_url: string;
  };
}

// Dashboard KPI types
export interface DashboardStats {
  totalPredictions: number;
  totalUsers: number;
  totalFeedbacks: number;
  totalIPM: number;
  severityBreakdown: { severity: string; count: number }[];
  riskBreakdown: { risk_level: string; count: number }[];
  severityByDistrict: { severity: string; musanze: number; nyabihu: number }[];
  predictionsOverTime: { date: string; musanze: number; nyabihu: number }[];
  recentPredictions: RecentPredictionEntry[];
  recentFeedbacks: RecentFeedbackEntry[];
  recentIPM: RecentIPMEntry[];
  recentTutorials: RecentTutorialEntry[];
}
