export type District = 'Musanze' | 'Nyabihu';
export type Role = 'Admin' | 'Farmer';

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  district: District;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  auth_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: number;
  district: District;
  role: Role;
  position: string | null;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
}
