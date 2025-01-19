import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { HabitWeekView } from './HabitWeekView';
import { format, addDays } from 'date-fns';
import { startOfWeek } from 'date-fns/startOfWeek';
import { HabitCalendarModal } from './HabitCalendarModal';
import { HabitAnalyticsModal } from './HabitAnalyticsModal';
import { PopupMenu } from './PopupMenu';
import Toast from 'react-native-toast-message';

const isDateInFrequency = (date, frequency) => {
  const dayId = format(date, 'eee').toLowerCase();
  return frequency.type === 'daily' || 
         (frequency.type === 'weekly' && frequency.days.includes(dayId));
};

function calculateStreak(progress, frequency) {
  const today = new Date();
  let currentStreak = 0;
  let date = today;
  let lastCompletedDate = null;

  const todayStr = format(today, 'yyyy-MM-dd');
  const yesterdayStr = format(addDays(today, -1), 'yyyy-MM-dd');
  
  const isToday = isDateInFrequency(today, frequency);
  const isYesterday = isDateInFrequency(addDays(today, -1), frequency);

  // Find the last required day before today
  let lastRequiredDay = today;
  while (lastRequiredDay >= addDays(today, -30)) {
    if (isDateInFrequency(lastRequiredDay, frequency)) {
      const dateStr = format(lastRequiredDay, 'yyyy-MM-dd');
      // If we found a completed day, this is our streak start
      if (progress[dateStr]?.completed) {
        lastCompletedDate = lastRequiredDay;
        break;
      }
      // If we found an uncompleted required day that isn't today, streak is broken
      if (lastRequiredDay < today && !progress[dateStr]?.completed) {
        return 0;
      }
      // If it's today and not completed, keep looking back
      if (lastRequiredDay === today && !progress[dateStr]?.completed) {
        lastRequiredDay = addDays(lastRequiredDay, -1);
        continue;
      }
    }
    lastRequiredDay = addDays(lastRequiredDay, -1);
  }

  // If no completed dates found, return 0
  if (!lastCompletedDate) return 0;

  // Count backwards from last completed date
  date = lastCompletedDate;
  currentStreak = 1;  // Start with 1 for the last completed date

  // Look backwards for more completed days
  date = addDays(date, -1);
  while (date >= addDays(today, -30)) {
    if (isDateInFrequency(date, frequency)) {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (!progress[dateStr]?.completed) {
        break;
      }
      currentStreak++;
    }
    date = addDays(date, -1);
  }

  return currentStreak;
}

function calculateCompletion(progress, frequency) {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  let completed = 0;
  let total = 0;

  const isDateInFrequency = (date) => {
    const dayId = format(date, 'eee').toLowerCase();
    return frequency.type === 'daily' || 
           (frequency.type === 'weekly' && frequency.days.includes(dayId));
  };

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    if (date > today) continue;
    
    // Only count days that match the habit frequency
    if (isDateInFrequency(date)) {
      const dateStr = format(date, 'yyyy-MM-dd');
      if (progress[dateStr]?.completed) completed++;
      total++;
    }
  }

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function HabitCard({ habit, onToggleDay, onEdit, onDelete }) {
  const streak = calculateStreak(habit.progress, habit.frequency);
  const completion = calculateCompletion(habit.progress, habit.frequency);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isAnalyticsVisible, setIsAnalyticsVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuButtonRef = useRef();

  const handleMenuPress = () => {
    menuButtonRef.current.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({
        top: pageY + height + 5,
        right: wp(100) - (pageX + width),
      });
      setMenuVisible(true);
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "This action cannot be undone. Your habit streak and completion history will be permanently deleted.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(habit.id);
            Toast.show({
              type: 'success',
              text1: 'Habit deleted successfully'
            });
          }
        }
      ]
    );
  };

  // Get the time left today if streak depends on today's completion
  const getStreakText = (streak) => {
    if (streak === 0) return 'No streak';
    
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const isCompletedToday = habit.progress[todayStr]?.completed;
    const isToday = isDateInFrequency(new Date(), habit.frequency);
    
    if (isToday && !isCompletedToday) {
      return `${streak} day streak - Complete today to continue!`;
    }
    
    return `${streak} day${streak === 1 ? '' : 's'}`;
  };

  const getFrequencyText = (frequency) => {
    if (frequency.type === 'daily') {
      return 'Every day';
    }
    // Add more frequency types here
    return 'Custom';
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.habitName}>{habit.name}</Text>
          <View style={styles.frequencyTag}>
            <Text style={styles.frequencyText}>
              {getFrequencyText(habit.frequency)}
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.menuButton}
          ref={menuButtonRef}
          onPress={handleMenuPress}
        >
          <MaterialIcons name="more-vert" size={24} color={theme.colors.textLight} />
        </TouchableOpacity>
      </View>

      <HabitWeekView habit={habit} onToggleDay={onToggleDay} />

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

      <PopupMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        position={menuPosition}
        options={[
          {
            id: 'edit',
            label: 'Edit',
            icon: 'edit',
            onPress: () => onEdit(habit),
          },
          {
            id: 'delete',
            label: 'Delete',
            icon: 'delete',
            destructive: true,
            onPress: handleDelete,
          },
        ]}
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