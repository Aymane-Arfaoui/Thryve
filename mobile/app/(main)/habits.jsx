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
import { useHabits } from '../../lib/firebase/hooks/useHabits';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, habitLogs, loading, addHabit, updateHabit, completeHabit, deleteHabit, updateHabitDays } = useHabits();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const handleToggleDay = async (habitId, dateStr) => {
    try {
      const result = await completeHabit(habitId, dateStr);
      
      if (result.completed) {
        Toast.show({
          type: 'success',
          text1: 'Habit completed!',
          text2: result.isNewRecord 
            ? `New record! ${result.newStreak} day streak! 🔥` 
            : result.newStreak > 1 
              ? `Keep it up! ${result.newStreak} day streak! 🔥`
              : 'Keep going! Start your streak! 💪'
        });
      } else {
        Toast.show({
          type: 'info',
          text1: 'Habit marked as incomplete',
          text2: 'You can always complete it later'
        });
      }
    } catch (error) {
      if (error.message === 'Cannot complete habits for future dates') {
        Toast.show({
          type: 'error',
          text1: 'Cannot complete future dates',
          text2: 'You can only complete habits for today or past days'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to update habit',
          text2: 'Please try again'
        });
      }
    }
  };

  const handleEdit = (habit) => {
    setHabitToEdit(habit);
    setIsAddModalVisible(true);
  };

  const handleDelete = (habitId) => {
    try {
      deleteHabit(habitId);
      Toast.show({
        type: 'success',
        text1: 'Habit deleted successfully'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete habit',
        text2: error.message
      });
    }
  };

  const handleSaveHabit = async (habitData) => {
    try {
      if (habitData.id) {
        // Editing existing habit
        await updateHabit(habitData);
        Toast.show({
          type: 'success',
          text1: 'Habit updated successfully'
        });
      } else {
        // Creating new habit
        await addHabit(habitData);
        Toast.show({
          type: 'success',
          text1: 'Habit created successfully'
        });
      }
      setIsAddModalVisible(false);
      setHabitToEdit(null);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to save habit',
        text2: error.message
      });
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
          <Text style={styles.title}>Habits</Text>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <LoadingSpinner />
          ) : habits.length > 0 ? (
            habits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                log={habitLogs.find(log => log.habitId === habit.id)}
                onToggleDay={handleToggleDay}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons 
                name="accessibility-new" 
                size={48} 
                color={theme.colors.gray + '80'}
              />
              <Text style={styles.emptyStateTitle}>No Habits Yet</Text>
              <Text style={styles.emptyStateText}>
                Start building better habits by adding your first one
              </Text>
            </View>
          )}
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    marginTop: hp(2),
  },
  emptyStateText: {
    fontSize: hp(1.8),
    color: theme.colors.gray,
    textAlign: 'center',
    padding: hp(2),
  },
}); 