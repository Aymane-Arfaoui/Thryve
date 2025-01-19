import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { HabitWeekView } from './HabitWeekView';
import { format, addDays } from 'date-fns';
import { startOfWeek } from 'date-fns/startOfWeek';
import { HabitCalendarModal } from './HabitCalendarModal';
import { HabitAnalyticsModal } from './HabitAnalyticsModal';

function calculateStreak(completedDates) {
  const today = new Date();
  let currentStreak = 0;
  let date = today;
  let isStreakActive = false;

  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(addDays(today, -1), 'yyyy-MM-dd');
  
  if (completedDates.includes(todayStr)) {
    isStreakActive = true;
    currentStreak = 0;
    date = addDays(today, -1);
  } else if (completedDates.includes(yesterdayStr)) {
    isStreakActive = true;
    currentStreak = 0;
    date = addDays(today, -2);
  } else {
    return 0;
  }

  while (isStreakActive) {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (!completedDates.includes(dateStr)) {
      break;
    }
    currentStreak++;
    date = addDays(date, -1);
  }

  return currentStreak + 1;
}

function calculateCompletion(completedDates) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  let completed = 0;
  let total = 0;

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    if (date > today) continue;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    if (completedDates.includes(dateStr)) completed++;
    total++;
  }

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function HabitCard({ habit, log, onToggleDay }) {
  const streak = habit.currentStreak;
  const completion = calculateCompletion(log?.completedDates || []);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);

  const getStreakText = (streak) => {
    if (streak === 0) return 'No streak';
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isCompletedToday = log?.completedDates.includes(todayStr);
    
    if (!isCompletedToday) {
      return `${streak} day streak - Complete today to continue!`;
    }
    
    return `${streak} day${streak === 1 ? '' : 's'}`;
  };

  const getFrequencyText = (habit) => {
    return `${habit.selectedDays.length} days per week`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.frequencyTag}>
            <Text style={styles.frequencyText}>
              {getFrequencyText(habit)}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="more-vert" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <HabitWeekView 
        habit={habit} 
        log={log}
        onToggleDay={onToggleDay} 
      />

      <View style={styles.footer}>
        <View style={styles.statsContainer}>
          <View style={styles.streakContainer}>
            <MaterialIcons 
              name="local-fire-department" 
              size={20} 
              color={streak > 0 ? theme.colors.orange : theme.colors.textLight}
            />
            <Text style={[
              styles.statsText,
              styles.streakText,
              streak > 0 && styles.streakActiveText
            ]}>
              {getStreakText(streak)}
            </Text>
          </View>
          <View style={styles.completionContainer}>
            <Text style={[styles.statsText, styles.bulletPoint]}>•</Text>
            <Text style={styles.statsText}>{completion}%</Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsCalendarVisible(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setIsAnalyticsVisible(true)}
          >
            <MaterialIcons name="analytics" size={20} color={theme.colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      <HabitCalendarModal
        visible={isCalendarVisible}
        onClose={() => setIsCalendarVisible(false)}
        habit={habit}
      />
      <HabitAnalyticsModal
        visible={isAnalyticsVisible}
        onClose={() => setIsAnalyticsVisible(false)}
        habit={habit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(2),
    marginBottom: hp(2),
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(2),
  },
  headerLeft: {
    flex: 1,
    marginRight: wp(2),
  },
  habitName: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(0.5),
  },
  frequencyTag: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  frequencyText: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  menuButton: {
    padding: wp(1),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp(2),
    paddingTop: hp(1),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
  },
  statsContainer: {
    flex: 1,
    marginRight: wp(2),
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  completionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(0.5),
  },
  statsText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  streakText: {
    flex: 1,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    gap: wp(2),
    alignSelf: 'flex-start',
  },
  actionButton: {
    padding: wp(1),
  },
  bulletPoint: {
    marginHorizontal: wp(1),
    color: theme.colors.gray,
  },
  streakActiveText: {
    color: theme.colors.orange,
    fontWeight: theme.fonts.bold,
  },
}); 