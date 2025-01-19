import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { HabitCard } from '../../components/HabitCard';
import { format } from 'date-fns';
import { AddHabitModal } from '../../components/AddHabitModal';
import Toast from 'react-native-toast-message';

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
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

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

  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setIsAddModalVisible(true);
  };

  const handleDelete = (habitId) => {
    setHabits(current => current.filter(h => h.id !== habitId));
  };

  const handleSaveHabit = (habitData) => {
    if (habitData.id) {
      // Editing existing habit
      setHabits(current =>
        current.map(habit =>
          habit.id === habitData.id ? { ...habit, ...habitData } : habit
        )
      );
      Toast.show({
        type: 'success',
        text1: 'Habit updated successfully'
      });
    } else {
      // Creating new habit
      setHabits(current => [...current, {
        ...habitData,
        id: Date.now().toString(),
      }]);
      Toast.show({
        type: 'success',
        text1: 'Habit created successfully'
      });
    }
    setIsAddModalVisible(false);
    setHabitToEdit(null);
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setIsAddModalVisible(true)}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.white} />
        </TouchableOpacity>

        <AddHabitModal
          visible={isAddModalVisible}
          onClose={() => {
            setIsAddModalVisible(false);
            setHabitToEdit(null);
          }}
          onSave={handleSaveHabit}
          habitToEdit={habitToEdit}
        />
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
    bottom: hp(4),
    right: wp(4),
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    backgroundColor: theme.colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    elevation: 4,
    shadowColor: theme.colors.orange,
    shadowOpacity: 0.4,
    transform: [{ scale: 1.02 }],
  },
}); 