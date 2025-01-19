import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEKDAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

export function AddHabitModal({ visible, onClose, onSave, habitToEdit }) {
  const [habitName, setHabitName] = useState(habitToEdit?.name || '');
  const [selectedDays, setSelectedDays] = useState(
    habitToEdit?.frequency?.type === 'weekly' && Array.isArray(habitToEdit?.frequency?.days)
      ? habitToEdit.frequency.days.reduce((acc, day) => ({
          ...acc,
          [day]: true
        }), {})
      : {}
  );
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (habitToEdit) {
      setHabitName(habitToEdit.name);
      if (habitToEdit.frequency?.type === 'weekly' && Array.isArray(habitToEdit.frequency?.days)) {
        setSelectedDays(
          habitToEdit.frequency.days.reduce((acc, day) => ({
            ...acc,
            [day]: true
          }), {})
        );
      } else {
        setSelectedDays({});
      }
    }
  }, [habitToEdit]);

  const toggleDay = (dayId) => {
    setSelectedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  const handleSave = () => {
    if (!habitName.trim()) return;
    
    onSave({
      id: habitToEdit?.id,
      name: habitName.trim(),
      frequency: {
        type: 'weekly',
        days: Object.entries(selectedDays)
          .filter(([_, isSelected]) => isSelected)
          .map(([day]) => day)
      },
      progress: habitToEdit?.progress || {}
    });

    // Reset form
    setHabitName('');
    setSelectedDays({});
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={[
            styles.modalContent,
            { paddingBottom: insets.bottom || hp(2) }
          ]}>
            <View style={styles.header}>
              <View style={styles.headerLine} />
              <Text style={styles.title}>{habitToEdit ? 'Edit Habit' : 'New Habit'}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Habit name"
              value={habitName}
              onChangeText={setHabitName}
              placeholderTextColor={theme.colors.textLight}
              autoFocus={true}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
            />

            <Text style={styles.sectionTitle}>Repeat on</Text>
            <View style={styles.daysContainer}>
              {WEEKDAYS.map(day => (
                <TouchableOpacity
                  key={day.id}
                  style={[
                    styles.dayButton,
                    selectedDays[day.id] && styles.dayButtonSelected
                  ]}
                  onPress={() => toggleDay(day.id)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDays[day.id] && styles.dayButtonTextSelected
                  ]}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[
                styles.saveButton,
                !habitName.trim() && styles.saveButtonDisabled
              ]}
              onPress={handleSave}
              disabled={!habitName.trim()}
            >
              <Text style={styles.saveButtonText}>{habitToEdit ? 'Save Changes' : 'Create Habit'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
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
    padding: hp(3),
    paddingTop: hp(1.5),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(3),
    marginTop: hp(1),
  },
  headerLine: {
    position: 'absolute',
    top: -hp(1),
    left: '35%',
    right: '35%',
    height: 4,
    backgroundColor: theme.colors.gray + '30',
    borderRadius: theme.radius.full,
  },
  title: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: wp(2),
    position: 'absolute',
    right: -wp(1),
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray + '40',
    borderRadius: theme.radius.lg,
    padding: hp(1.5),
    fontSize: hp(1.6),
    color: theme.colors.dark,
    marginBottom: hp(2),
    backgroundColor: theme.colors.gray + '08',
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(1),
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp(3),
  },
  dayButton: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(5.5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.gray + '40',
    ...theme.shadows.sm,
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.orange,
    borderColor: theme.colors.orange,
    transform: [{ scale: 1.05 }],
    ...theme.shadows.md,
  },
  dayButtonText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  dayButtonTextSelected: {
    color: theme.colors.white,
    fontWeight: theme.fonts.bold,
    transform: [{ scale: 1.05 }],
  },
  saveButton: {
    backgroundColor: theme.colors.orange,
    borderRadius: theme.radius.lg,
    padding: hp(1.8),
    alignItems: 'center',
    marginTop: hp(2),
    ...theme.shadows.sm,
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.gray + '40',
  },
  saveButtonText: {
    color: theme.colors.white,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
  },
}); 