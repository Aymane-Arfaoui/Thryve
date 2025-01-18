import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { format } from 'date-fns';

export function HabitCalendarModal({ visible, onClose, habit }) {
  const markedDates = Object.entries(habit.progress).reduce((acc, [date, value]) => {
    if (value.completed) {
      acc[date] = {
        marked: true,
        dotColor: theme.colors.success
      };
    }
    return acc;
  }, {});

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>{habit.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
          
          <Calendar
            markedDates={markedDates}
            enableSwipeMonths={true}
            renderArrow={(direction) => (
              <MaterialIcons
                name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
                size={30}
                color={theme.colors.dark}
              />
            )}
            theme={{
              calendarBackground: theme.colors.white,
              textSectionTitleColor: theme.colors.textLight,
              selectedDayTextColor: theme.colors.white,
              selectedDayBackgroundColor: theme.colors.primary,
              todayBackgroundColor: theme.colors.primary + '15',
              todayTextColor: theme.colors.dark,
              dayTextColor: theme.colors.dark,
              textDisabledColor: theme.colors.textLight + '50',
              dotColor: theme.colors.success,
              monthTextColor: theme.colors.dark,
              arrowStyle: {
                padding: wp(2),
                margin: wp(2),
                backgroundColor: theme.colors.gray + '20',
                borderRadius: theme.radius.full,
              },
              textMonthFontWeight: theme.fonts.bold,
              textDayFontWeight: theme.fonts.medium,
              textDayHeaderFontWeight: theme.fonts.semibold,
            }}
            hideArrows={false}
            hideExtraDays={false}
            current={format(new Date(), 'yyyy-MM-dd')}
            monthFormat={'MMMM yyyy'}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: hp(2),
    minHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  closeButton: {
    padding: wp(2),
  },
}); 