import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { getUserData } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, ProgressChart } from 'react-native-chart-kit';

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

  // Dummy data for progress chart
  const progressData = {
    labels: ["Calls", "Goals", "Score"], // these are percentages
    data: [0.8, 0.6, 0.9]
  };

  // Dummy data for weekly activity
  const weeklyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43, 50]
    }]
  };

  const chartWidth = Dimensions.get('window').width - wp(10) - hp(6); // Account for padding

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton router={router} />
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.welcomeText}>
            Hi, {userData?.first_name || 'User'}!
          </Text>

          <View style={styles.dashboardCard}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <View style={styles.chartContainer}>
              <ProgressChart
                data={progressData}
                width={chartWidth}
                height={hp(20)}
                strokeWidth={16}
                radius={32}
                chartConfig={{
                  backgroundColor: theme.colors.white,
                  backgroundGradientFrom: theme.colors.white,
                  backgroundGradientTo: theme.colors.white,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                  labelColor: () => theme.colors.textLight,
                }}
                hideLegend={false}
                style={styles.chart}
              />
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>85%</Text>
                <Text style={styles.statLabel}>Daily Goal</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>24</Text>
                <Text style={styles.statLabel}>Calls Made</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Avg. Rating</Text>
              </View>
            </View>
          </View>

          <View style={styles.dashboardCard}>
            <Text style={styles.cardTitle}>Weekly Activity</Text>
            <View style={styles.chartContainer}>
              <LineChart
                data={weeklyData}
                width={chartWidth}
                height={hp(20)}
                chartConfig={{
                  backgroundColor: theme.colors.white,
                  backgroundGradientFrom: theme.colors.white,
                  backgroundGradientTo: theme.colors.white,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(81, 150, 244, ${opacity})`,
                  labelColor: () => theme.colors.textLight,
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: theme.colors.primary
                  }
                }}
                bezier
                style={styles.chart}
              />
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>
                {userData?.first_name} {userData?.last_name}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{userData?.email}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{userData?.phone_number || 'Not set'}</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Member Since</Text>
              <Text style={styles.value}>
                {new Date(userData?.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </ScrollView>

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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(2), // Add some padding at the bottom
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginBottom: hp(4),
  },
  infoCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'column',
    paddingVertical: hp(1),
  },
  label: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    marginBottom: hp(0.5),
  },
  value: {
    fontSize: hp(2),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray,
    marginVertical: hp(1.5),
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
  dashboardCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    marginBottom: hp(3),
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  cardTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: hp(2),
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  chartContainer: {
    alignItems: 'center',
    marginHorizontal: -hp(3), // Compensate for card padding
  },
  chart: {
    borderRadius: 16,
    marginVertical: hp(1),
  },
});