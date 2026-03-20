export type District = 'Nyabihu' | 'Musanze';
export type TutorialType = 'video' | 'reading';
export type TutorialTopic = 'scan' | 'mln' | 'ipm' | 'weather';

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  type: TutorialType;
  topic: TutorialTopic;
  duration: string;
  thumbnailIcon: string;
  isSaved: boolean;
}

export interface SavedTutorial extends Tutorial {
  progressPercent: number;
  notes: Note[];
}

export interface Note {
  id: string;
  tutorialId: string;
  content: string;
  savedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  district: District;
  avatarUrl?: string;
}
