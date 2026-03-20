import { supabase } from '../lib/supabase';
import { RegisterFormData, LoginFormData, AuthResponse, AuthUser, UserProfile } from '../types/auth.types';

/*
  IMPORTANT — Profile Creation Strategy:
  
  The public.profiles record is NOT created from the app code.
  It is created automatically by a Supabase PostgreSQL trigger
  that fires AFTER a user confirms their email.
  
  The trigger function to add in Supabase SQL Editor is:
  
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (
      auth_id,
      first_name,
      last_name,
      email,
      phone_number,
      district,
      role
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.email,
      (NEW.raw_user_meta_data->>'phone_number')::BIGINT,
      NEW.raw_user_meta_data->>'district',
      'Farmer'  -- default role for all self-registered users
    );
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (
      OLD.email_confirmed_at IS NULL 
      AND NEW.email_confirmed_at IS NOT NULL
    )
    EXECUTE FUNCTION public.handle_new_user();
    
  This means we pass firstName, lastName, phoneNumber, and district
  as raw_user_meta_data in the signUp call so the trigger can use them.
*/

export async function registerUser(data: RegisterFormData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: 'ikigori://auth/confirm',
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          district: data.district,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (authData.user && !authData.user.email_confirmed_at) {
      return {
        success: true,
        message: 'Registration successful. Please check your email to confirm your account before logging in.',
      };
    }

    return {
      success: true,
      message: 'Registration successful.',
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}

export async function loginUser(data: LoginFormData): Promise<AuthResponse> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        throw new Error('Please confirm your email before logging in. Check your inbox.');
      }
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        throw new Error('Incorrect email or password.');
      }
      throw new Error(error.message);
    }

    if (!authData.user) {
      throw new Error('Login failed. Please try again.');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', authData.user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Account setup incomplete. Please contact support.');
    }

    const authUser: AuthUser = {
      id: authData.user.id,
      email: authData.user.email!,
      profile: profile as UserProfile,
    };

    return {
      success: true,
      message: 'Login successful',
      user: authUser,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Login failed');
  }
}

export async function getCurrentSession(): Promise<AuthUser | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_id', session.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email!,
      profile: profile as UserProfile,
    };
  } catch (error) {
    return null;
  }
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}
