import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { HabitCard } from '../../components/HabitCard';
import { format } from 'date-fns';

// Updated dummy data with new structure
const DUMMY_HABITS = [
  {
    id: '1',
    name: "Do not drink alcohol",
    frequency: {
      type: 'daily',
    },
    reminders: {
      enabled: true,
      times: [
        { day: 0, times: ['09:00'] },
        { day: 1, times: ['09:00'] },
        { day: 2, times: ['09:00'] },
        { day: 3, times: ['09:00'] },
        { day: 4, times: ['09:00'] },
        { day: 5, times: ['09:00'] },
        { day: 6, times: ['09:00'] },
      ],
    },
    startDate: new Date(2024, 0, 1),
    progress: {
      '2024-01-15': { completed: true, timestamp: Date.now() },
      '2024-01-16': { completed: true, timestamp: Date.now() },
      '2024-01-17': { completed: true, timestamp: Date.now() },
    },
  },
  // ... more dummy habits
];

export default function HabitsScreen() {
  const router = useRouter();
  const [habits, setHabits] = useState(DUMMY_HABITS);

  const handleToggleDay = (habitId, dateStr) => {
    const habit = habits.find(h => h.id === habitId);
    const isCompleted = habit.progress[dateStr]?.completed;

    if (isCompleted) {
      Alert.alert(
        "Mark Incomplete",
        "Are you sure you want to mark this habit as incomplete?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Yes",
            onPress: () => updateHabitProgress(habitId, dateStr, false)
          }
        ]
      );
    } else {
      updateHabitProgress(habitId, dateStr, true);
    }
  };

  const updateHabitProgress = (habitId, dateStr, completed) => {
    setHabits(currentHabits =>
      currentHabits.map(habit => {
        if (habit.id === habitId) {
          return {
            ...habit,
            progress: {
              ...habit.progress,
              [dateStr]: {
                completed,
                timestamp: Date.now()
              }
            }
          };
        }
        return habit;
      })
    );
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
          <Text style={styles.title}>Habits</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {habits.map(habit => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleDay={handleToggleDay}
            />
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => console.log('Add new habit')}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.white} />
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
  scrollContent: {
    padding: hp(2),
  },
  fab: {
    position: 'absolute',
    right: wp(4),
    bottom: hp(4),
    width: wp(14),
    height: wp(14),
    borderRadius: wp(7),
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
}); 