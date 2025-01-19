import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { HabitCard } from '../../components/HabitCard';
import { useHabits } from '../../lib/firebase/hooks/useHabits';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function HabitsScreen() {
  const router = useRouter();
  const { habits, habitLogs, loading, completeHabit, deleteHabit, updateHabitDays, addHabit } = useHabits();

  const handleToggleDay = (habitId, dateStr) => {
    // This will handle both completing and uncompleting a habit for a specific date
    completeHabit(habitId);
  };

  const handleDeleteHabit = (habitId) => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: () => deleteHabit(habitId),
          style: 'destructive'
        }
      ]
    );
  };

  const handleUpdateDays = (habitId, selectedDays) => {
    updateHabitDays(habitId, selectedDays);
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
                onToggleDay={handleToggleDay}
                log={habitLogs.find(log => log.habitId === habit.id)}
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
          onPress={() => {/* TODO: Implement habit creation */}}
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
    marginTop: hp(1),
  },
}); 