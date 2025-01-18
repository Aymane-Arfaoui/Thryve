import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { hp } from '../../helpers/common';
import { getUserData } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const response = await getUserData(user.id);
        if (response.success) {
          setUserData(response.data);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out", "Error signing out");
    }
  };

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton router={router} />
        </View>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>
            Hi, {userData?.first_name || 'User'}!
          </Text>
          <Text style={styles.emailText}>
            {userData?.email}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginBottom: hp(1),
  },
  emailText: {
    fontSize: hp(2),
    color: theme.colors.textLight,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    marginHorizontal: 20,
    marginBottom: hp(4),
    padding: hp(2),
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  logoutText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
});