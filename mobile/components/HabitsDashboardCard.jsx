import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { useHabits } from '../lib/firebase/hooks/useHabits';

export const HabitsDashboardCard = ({ onPress }) => {
  const { habits, loading } = useHabits();

  const getCompletedHabitsToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return habits.filter(habit => habit.progress?.[today]?.completed).length;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="repeat" size={24} color={theme.colors.dark} />
          <Text style={styles.title}>Habits</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={theme.colors.dark} />
      </View>

      <View style={styles.content}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{habits.length}</Text>
          <Text style={styles.statLabel}>Total Habits</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{getCompletedHabitsToday()}</Text>
          <Text style={styles.statLabel}>Completed Today</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    marginBottom: hp(3),
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
    marginBottom: hp(0.5),
  },
  statLabel: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
}); 