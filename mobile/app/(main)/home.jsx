import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions, ScrollView, Platform, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../../lib/supabase';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { getUserData, initiateCall } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { TaskItem } from '../../components/TaskItem';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { TaskModal } from '../../components/TaskModal';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

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

  useEffect(() => {
    console.log('Current user context:', user);
    console.log('Current userData state:', userData);
  }, [user, userData]);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign Out", "Error signing out");
    }
  };

//   Dummy data for progress chart
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

  // Update chart configs
  const chartConfig = {
    backgroundColor: theme.colors.white,
    backgroundGradientFrom: theme.colors.white,
    backgroundGradientTo: theme.colors.white,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(67, 56, 202, ${opacity})`, // Indigo color
    labelColor: () => theme.colors.textLight,
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: theme.colors.primary
    }
  };

  // Update the dummy data naming
  const tasks = [
    { id: 1, name: "Finish assignment", dueDate: "2025-01-22" },
    { id: 2, name: "Buy groceries", dueDate: "2025-01-20" }
  ];

  const goals = [
    { id: 1, name: "Start a workout routine", duration: "3 months" },
    { id: 2, name: "Learn a new language", duration: "6 months" }
  ];

  const handleCompleteTask = (taskId, type) => {
    console.log(`Completing ${type}-term task ${taskId}`);
    // Implement task completion logic here
  };

  const handleSaveTask = (task) => {
    console.log('New task:', task);
    // Here you would typically save the task to your backend
    // For now, we can just log it
  };

  const handleTestCall = async () => {
    try {
      console.log('Current userData:', userData);
      
      if (!userData?.id) {
        console.error('No user ID found in userData');
        Alert.alert('Error', 'User data not found');
        return;
      }

      console.log('Initiating call with userData:', {
        userId: userData.id,
        userData: userData
      });

      const result = await initiateCall(userData.id);
      
      if (result.success) {
        console.log('Call initiated successfully:', result.data);
        Alert.alert('Success', 'Call initiated!');
      } else {
        console.error('Failed to initiate call:', result.msg);
        Alert.alert('Error', 'Failed to start call');
      }
    } catch (error) {
      console.error('Error in handleTestCall:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <ScreenWrapper>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>
              Welcome, {userData?.first_name || 'User'}
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(main)/settings')}
              style={styles.settingsButton}
            >
              <MaterialIcons name="settings" size={24} color={theme.colors.dark} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.scoreCardContainer}>
              <View style={[styles.scoreCard, { backgroundColor: '#4338ca' }]}>
                <View style={styles.scoreHeader}>
                  <Text style={styles.scoreTitle}>Overall Score</Text>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>This Week</Text>
                  </View>
                </View>
                <Text style={styles.scoreValue}>92</Text>
                <View style={styles.scoreFooter}>
                  <View style={styles.scoreChange}>
                     <Text style={styles.scoreChangeIcon}>↑</Text>
                    <Text style={styles.scoreChangeText}>8% from last week</Text> 
                  </View>
                  <TouchableOpacity style={styles.scoreDetailsButton}>
                    <Text style={styles.scoreDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.scheduleCallButton}
                  onPress={handleTestCall}
                >
                  <Text style={styles.scheduleCallText}>Schedule a Call</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Weekly Activity</Text>
              <View style={styles.chartContainer}>
                <LineChart
                  data={weeklyData}
                  width={chartWidth}
                  height={hp(20)}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </View>
            </View>

            <View style={styles.tasksContainer}>
              <View style={styles.tasksList}>
                <View style={styles.tasksHeader}>
                  <View style={styles.headerLeft}>
                    <MaterialIcons name="check-circle" size={24} color={theme.colors.dark} />
                    <Text style={styles.tasksTitle}>Tasks</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setIsTaskModalVisible(true)}
                    style={styles.addButton}
                  >
                    <MaterialIcons name="add" size={24} color={theme.colors.button} />
                  </TouchableOpacity>
                </View>
                
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={{
                      id: task.id.toString(),
                      name: task.name,
                      dueDate: task.dueDate,
                      priority: 'Due',
                      completed: false
                    }}
                  />
                ))}
              </View>

              <View style={styles.tasksList}>
                <View style={styles.tasksHeader}>
                  <View style={styles.headerLeft}>
                    <MaterialIcons name="track-changes" size={24} color={theme.colors.dark} />
                    <Text style={styles.tasksTitle}>Goals</Text>
                  </View>
                </View>
                
                {goals.map(goal => (
                  <TaskItem
                    key={goal.id}
                    task={{
                      id: goal.id.toString(),
                      name: goal.name,
                      dueDate: goal.duration,
                      priority: 'Duration',
                      completed: false
                    }}
                  />
                ))}
              </View>
            </View>

            <View style={styles.dashboardCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Habits</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(main)/habits')}
                  style={styles.viewAllButton}
                >
                  <Text style={styles.viewAllText}>View All</Text>
                  <MaterialIcons name="arrow-forward" size={16} color={theme.colors.button} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.habitSubtext}>
                Track your daily habits and build consistency
              </Text>
            </View>

            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Your Progress</Text>
              <View style={styles.chartContainer}>
                <ProgressChart
                  data={progressData}
                  width={chartWidth}
                  height={hp(20)}
                  strokeWidth={16}
                  radius={32}
                  chartConfig={chartConfig}
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
          </ScrollView>
        </View>
      </GestureHandlerRootView>
      
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity 
          style={styles.bottomButton}
          onPress={handleTestCall}
        >
          <MaterialIcons name="phone" size={24} color={theme.colors.white} />
          <Text style={styles.bottomButtonText}>Schedule a Call</Text>
        </TouchableOpacity>
      </View>

      <TaskModal
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        onSave={handleSaveTask}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  welcomeText: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  settingsButton: {
    padding: wp(2),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray + '20',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: wp(5),
    paddingTop: hp(4),
    paddingBottom: hp(2), // Add some padding at the bottom
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
  dashboardCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    marginBottom: hp(3),
    ...theme.shadows.sm,
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
    color: '#4338ca', // Indigo-600
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
  scoreCardContainer: {
    marginBottom: hp(3),
  },
  scoreCard: {
    backgroundColor: '#4338ca', // Indigo-600
    borderRadius: theme.radius.lg,
    padding: hp(3),
    shadowColor: theme.colors.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  scoreTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.white,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: theme.radius.full,
  },
  scoreBadgeText: {
    color: theme.colors.white,
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
  },
  scoreValue: {
    fontSize: hp(6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.white,
    marginBottom: hp(2),
  },
  scoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreChangeIcon: {
    color: '#10b981', // Emerald-500
    fontSize: hp(2),
    marginRight: wp(1),
  },
  scoreChangeText: {
    color: theme.colors.white,
    fontSize: hp(1.6),
  },
  scoreDetailsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: theme.radius.full,
  },
  scoreDetailsText: {
    color: theme.colors.white,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
  },
  tasksContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    marginBottom: hp(3),
    ...theme.shadows.sm,
  },
  tasksList: {
    marginBottom: hp(4), // Increased spacing between lists
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2), // Increased spacing before tasks
    paddingBottom: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '40',
  },
  tasksTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  viewAllText: {
    fontSize: hp(1.6),
    color: theme.colors.button,
    fontWeight: theme.fonts.medium,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  addButton: {
    padding: wp(1),
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.gray + '20',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  habitSubtext: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: hp(1),
  },
  scheduleCallButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: theme.radius.full,
    marginTop: hp(2),
    alignItems: 'center',
  },
  scheduleCallText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: wp(5),
    paddingBottom: Platform.OS === 'ios' ? hp(4) : hp(2),
    paddingTop: hp(2),
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
  },
  bottomButton: {
    backgroundColor: '#4338ca',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp(1.8),
    borderRadius: theme.radius.full,
    gap: wp(2),
  },
  bottomButtonText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
});