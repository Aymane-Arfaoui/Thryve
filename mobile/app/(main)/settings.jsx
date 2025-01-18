import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error.message);
          return;
        }

        if (currentUser) {
          // Format the member since date
          const memberSince = new Date(currentUser.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          setUserData({
            fullName: currentUser.user_metadata.full_name,
            email: currentUser.email,
            phone: currentUser.user_metadata.phone_number,
            memberSince
          });
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      Alert.alert("Error", "Failed to sign out");
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.dark} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <View style={styles.infoCard}>
              <InfoRow label="Full Name" value={userData?.fullName} />
              <InfoRow label="Email" value={userData?.email} />
              <InfoRow label="Phone" value={userData?.phone} />
              <InfoRow label="Member Since" value={userData?.memberSince} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color={theme.colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '40',
  },
  backButton: {
    padding: wp(2),
    marginRight: wp(2),
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: hp(3),
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    ...theme.shadows.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '20',
  },
  infoLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  infoValue: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    marginHorizontal: wp(3),
    marginTop: hp(2),
    padding: hp(2),
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.radius.lg,
  },
  logoutText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.error,
  },
}); 