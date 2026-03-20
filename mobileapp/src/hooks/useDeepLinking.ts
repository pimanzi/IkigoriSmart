import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';

export const useDeepLinking = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (profile) {
          queryClient.setQueryData(['currentUser'], {
            id: session.user.id,
            email: session.user.email,
            profile,
          });

          Toast.show({
            type: 'success',
            text1: t('auth.toast.emailConfirmed'),
          });

          navigation.navigate('MainTabs' as never);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigation, queryClient, t]);
};
