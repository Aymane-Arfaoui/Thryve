import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function WeeklyProgress({ progress, onToggleDay }) {
  const today = new Date().getDay();

  return (
    <View style={styles.container}>
      {DAYS.map((day, index) => {
        const isToday = (index + 1) % 7 === today;
        const isCompleted = progress[index];

        return (
          <TouchableOpacity
            key={index}
            onPress={() => onToggleDay(index)}
            style={[
              styles.dayCircle,
              isCompleted && styles.completed,
              isToday && styles.today,
            ]}
          >
            <Text style={[
              styles.dayText,
              isCompleted && styles.completedText,
              isToday && styles.todayText,
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(2),
  },
  dayCircle: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    borderWidth: 1,
    borderColor: theme.colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  completed: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  completedText: {
    color: theme.colors.white,
  },
  today: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  todayText: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.bold,
  },
}); 