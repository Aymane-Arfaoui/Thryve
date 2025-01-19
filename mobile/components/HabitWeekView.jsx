import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { format, addDays, isToday, addWeeks, subWeeks } from 'date-fns';
import { startOfWeek } from 'date-fns/startOfWeek';

export function HabitWeekView({ habit, onToggleDay }) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEndDate = addDays(weekStart, 6);
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const handlePress = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    onToggleDay(habit.id, dateStr);
  };

  const navigateWeek = (direction) => {
    setCurrentWeek(current => 
      direction === 'next' ? addWeeks(current, 1) : subWeeks(current, 1)
    );
  };

  const isDateSelectable = (date) => {
    const dayId = format(date, 'eee').toLowerCase();
    return habit.frequency.type === 'daily' || 
           (habit.frequency.type === 'weekly' && habit.frequency.days.includes(dayId));
  };

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        <TouchableOpacity 
          onPress={() => navigateWeek('prev')}
          style={styles.weekNavButton}
        >
          <MaterialIcons name="chevron-left" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.weekLabel}>
          {format(weekStart, 'MMM d')} - {format(weekEndDate, 'MMM d, yyyy')}
        </Text>
        <TouchableOpacity 
          onPress={() => navigateWeek('next')}
          style={styles.weekNavButton}
        >
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>
      <View style={styles.daysContainer}>
        {weekDays.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const isCompleted = habit.progress[dateStr]?.completed;
          const isPast = date <= new Date();
          const isCurrentDay = isToday(date);
          const isSelectable = isDateSelectable(date);

          return (
            <TouchableOpacity
              key={dateStr}
              style={[
                styles.dayButton,
                !isPast && styles.futureDay,
                isCurrentDay && !isCompleted && styles.currentDay,
                isCompleted && styles.completedDay,
                !isSelectable && styles.unselectedDay,
              ]}
              onPress={() => isPast && isSelectable && handlePress(date)}
              disabled={!isPast || !isSelectable}
            >
              <Text style={[
                styles.dayLabel,
                isCurrentDay && !isCompleted && styles.currentDayText,
                isCompleted && styles.completedText,
                !isSelectable && styles.unselectedText,
              ]}>
                {format(date, 'EEE')[0]}
              </Text>
              <Text style={[
                styles.dateLabel,
                isCurrentDay && !isCompleted && styles.currentDayText,
                isCompleted && styles.completedText,
                !isSelectable && styles.unselectedText,
              ]}>
                {format(date, 'd')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: hp(1),
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(1),
    marginBottom: hp(2),
  },
  weekNavButton: {
    padding: wp(1),
    borderRadius: theme.radius.full,
  },
  weekLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    textAlign: 'center',
    flex: 1,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(1),
    gap: wp(1.5),
  },
  dayButton: {
    width: wp(9),
    height: wp(9),
    borderRadius: wp(4.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray + '40',
    ...theme.shadows.sm,
  },
  completedDay: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
    ...theme.shadows.md,
  },
  futureDay: {
    opacity: 0.5,
  },
  currentDay: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
    transform: [{ scale: 1.1 }],
    zIndex: 1,
  },
  dayLabel: {
    fontSize: hp(1.1),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  dateLabel: {
    fontSize: hp(1.3),
    color: theme.colors.dark,
    fontWeight: theme.fonts.bold,
  },
  completedText: {
    color: theme.colors.white,
    fontWeight: theme.fonts.bold,
  },
  currentDayText: {
    color: theme.colors.dark,
    fontWeight: theme.fonts.bold,
  },
  unselectedDay: {
    opacity: 0.3,
    backgroundColor: theme.colors.gray + '20',
    borderColor: theme.colors.gray + '20',
  },
  unselectedText: {
    color: theme.colors.textLight,
  },
}); 