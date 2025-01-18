import { View, Text, LogBox } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { AuthProvider, useAuth } from '../contexts/AuthContext'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

LogBox.ignoreLogs([
  'Warning: TNodeChildrenRenderer', 
  'Warning: MemoizedTNodeRenderer',
  'Warning: TRenderEngineProvider: Support for defaultProps will be removed from function components'
]);

const _layout = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
      <Toast />
    </SafeAreaProvider>
  );
}

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  const updateUserData = async (user, email) => {
    if (user) {
      const { data: { user: userData } } = await supabase.auth.getUser();
      if (userData) {
        setUserData({ ...userData.user_metadata, email });
      }
    }
  }

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session.user);
        updateUserData(session.user, session.user.email);
        router.replace('/(main)/home');
      } else {
        setAuth(null);
        router.replace('/welcome');
      }
    });
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    />
  );
}

export default _layout;