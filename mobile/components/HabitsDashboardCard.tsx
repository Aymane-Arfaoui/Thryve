import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { CircularProgress } from './CircularProgress';
import { useHabits } from '../lib/firebase/hooks/useHabits';

export function HabitsDashboardCard({ onPress }) {
  const { habits } = useHabits();

  const stats = useMemo(() => {
    if (!habits.length) return null;

    const activeHabits = habits.filter(h => h.currentStreak > 0);
    const bestStreak = Math.max(...habits.map(h => h.currentStreak));
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + Object.values(habit.progress || {}).filter(p => p.completed).length, 0
    );

    const weeklyCompletion = habits.reduce((sum, habit) => {
      const lastWeekEntries = Object.entries(habit.progress || {})
        .filter(([date]) => {
          const entryDate = new Date(date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return entryDate >= weekAgo;
        });
      
      return sum + (lastWeekEntries.filter(([_, p]) => p.completed).length / 
                   Math.max(lastWeekEntries.length, 1));
    }, 0) / Math.max(habits.length, 1) * 100;

    return {
      total: habits.length,
      active: activeHabits.length,
      bestStreak,
      weeklyCompletion: Math.round(weeklyCompletion)
    };
  }, [habits]);

  // Get top 3 habits by streak
  const topHabits = useMemo(() => {
    return [...habits]
      .sort((a, b) => b.currentStreak - a.currentStreak)
      .slice(0, 3);
  }, [habits]);

  if (!stats) return null;

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons 
            name="repeat" 
            size={24} 
            color={theme.colors.primary}
          />
          <Text style={styles.title}>Habits Overview</Text>
        </View>
        <View style={styles.viewAllContainer}>
          <Text style={styles.viewAllText}>View All</Text>
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color={theme.colors.primary}
          />
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <CircularProgress 
            value={stats.weeklyCompletion} 
            radius={wp(10)}
            strokeWidth={wp(1.5)}
            color={theme.colors.primary}
          />
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.weeklyCompletion}%</Text>
            <Text style={styles.statLabel}>Weekly Progress</Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.statItem}>
          <View style={styles.streakContainer}>
            <MaterialIcons 
              name="local-fire-department" 
              size={36} 
              color={stats.bestStreak > 0 ? theme.colors.orange : theme.colors.textLight}
            />
            <Text style={[
              styles.streakValue,
              stats.bestStreak > 0 && styles.activeStreakValue
            ]}>
              {stats.bestStreak}
            </Text>
          </View>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.statItem}>
          <Text style={styles.habitCount}>{stats.total}</Text>
          <Text style={styles.statLabel}>
            <Text style={styles.activeCount}>{stats.active}</Text>/{stats.total} Active
          </Text>
        </View>
      </View>

      {topHabits.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.topHabitsContainer}>
            <Text style={styles.sectionTitle}>Top Performing Habits</Text>
            {topHabits.map(habit => (
              <View key={habit.id} style={styles.miniHabitCard}>
                <View style={styles.miniHabitInfo}>
                  <Text style={styles.miniHabitName} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  <Text style={styles.miniHabitFreq}>
                    {habit.frequency.type === 'daily' ? 'Daily' : 'Weekly'}
                  </Text>
                </View>
                <View style={styles.miniHabitStreak}>
                  <MaterialIcons 
                    name="local-fire-department" 
                    size={18} 
                    color={habit.currentStreak > 0 ? theme.colors.orange : theme.colors.textLight}
                  />
                  <Text style={[
                    styles.miniStreakValue,
                    habit.currentStreak > 0 && styles.activeStreakValue
                  ]}>
                    {habit.currentStreak} day streak
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(3),
    marginBottom: hp(3),
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  viewAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  viewAllText: {
    fontSize: hp(1.6),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(2),
    marginBottom: hp(3),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statTextContainer: {
    alignItems: 'center',
    marginTop: hp(1.5),
  },
  statValue: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  statLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
    fontWeight: theme.fonts.medium,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  streakValue: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight,
  },
  activeStreakValue: {
    color: theme.colors.orange,
  },
  habitCount: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  activeCount: {
    color: theme.colors.success,
    fontWeight: theme.fonts.bold,
  },
  verticalDivider: {
    width: 1,
    height: hp(8),
    backgroundColor: theme.colors.gray + '20',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray + '20',
    marginVertical: hp(3),
  },
  topHabitsContainer: {
    gap: hp(1.5),
  },
  sectionTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(1),
  },
  miniHabitCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray + '08',
    padding: hp(2),
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.gray + '15',
  },
  miniHabitInfo: {
    flex: 1,
    marginRight: wp(2),
  },
  miniHabitName: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(0.3),
  },
  miniHabitFreq: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  miniHabitStreak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
    backgroundColor: theme.colors.white,
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: theme.radius.full,
    ...theme.shadows.sm,
  },
  miniStreakValue: {
    fontSize: hp(1.4),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textLight,
  },
}); 