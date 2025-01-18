import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { MaterialIcons } from '@expo/vector-icons';
import { InputField } from './InputField';
import DateTimePicker from '@react-native-community/datetimepicker';
import { FormButton } from './FormButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';

interface TaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (task: { name: string; dueDate: Date; priority: string }) => void;
}

const PRIORITIES = [
  { label: 'High', value: 'high', color: theme.colors.error },
  { label: 'Medium', value: 'medium', color: theme.colors.orange },
  { label: 'Low', value: 'low', color: theme.colors.success },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8; // Increased to 80% for better visibility

type DateTimeStep = 'date' | 'time' | null;

export function TaskModal({ visible, onClose, onSave }: TaskModalProps) {
  const insets = useSafeAreaInsets();
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState('medium');
  const [dateTimeStep, setDateTimeStep] = useState<DateTimeStep>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleSave = () => {
    if (!taskName.trim()) return;
    Keyboard.dismiss();
    onSave({ name: taskName, dueDate, priority });
    setTaskName('');
    setDueDate(new Date());
    setPriority('medium');
    onClose();
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  const formatDateTime = (date: Date) => {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  const handleDateTimePress = () => {
    Keyboard.dismiss();
    setDateTimeStep('date');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar style="light" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.keyboardView,
          { paddingTop: insets.top }
        ]}
      >
        <Pressable 
          style={styles.overlay} 
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <Pressable 
            style={[
              styles.container,
              { 
                maxHeight: MODAL_HEIGHT - insets.top,
                paddingBottom: Math.max(insets.bottom, 16)
              }
            ]} 
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.handle} />
            
            <View style={styles.header}>
              <Text style={styles.title}>New Task</Text>
              <TouchableOpacity 
                onPress={onClose} 
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <InputField
                label="Task Name"
                value={taskName}
                onChangeText={setTaskName}
                placeholder="Enter task name"
                autoFocus
                returnKeyType="next"
              />

              <TouchableOpacity 
                style={styles.dateTimeButton}
                onPress={handleDateTimePress}
              >
                <View style={styles.dateTimeContent}>
                  <MaterialIcons name="event" size={24} color={theme.colors.textLight} />
                  <View style={styles.dateTimeTextContainer}>
                    <Text style={styles.dateTimeLabel}>Due Date & Time</Text>
                    <Text style={styles.dateTimeValue}>
                      {formatDateTime(dueDate)}
                    </Text>
                  </View>
                </View>
                <MaterialIcons 
                  name="chevron-right" 
                  size={24} 
                  color={theme.colors.textLight} 
                />
              </TouchableOpacity>

              <View style={styles.priorityContainer}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityButtons}>
                  {PRIORITIES.map(({ label, value, color }) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.priorityButton,
                        priority === value && { backgroundColor: color + '20' },
                        priority === value && { borderColor: color }
                      ]}
                      onPress={() => setPriority(value)}
                    >
                      <Text style={[
                        styles.priorityText,
                        priority === value && { color }
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <FormButton
                title="Save Task"
                onPress={handleSave}
                disabled={!taskName.trim()}
              />
            </View>

            <Modal
              visible={dateTimeStep !== null}
              transparent
              animationType="fade"
              statusBarTranslucent
            >
              <View style={styles.dateTimeModalOverlay}>
                <View style={styles.dateTimeModalContainer}>
                  <View style={styles.dateTimeModalHeader}>
                    <Text style={styles.dateTimeModalTitle}>
                      {dateTimeStep === 'date' ? 'Select Date' : 'Select Time'}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setDateTimeStep(null)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
                    </TouchableOpacity>
                  </View>

                  <DateTimePicker
                    value={dueDate}
                    mode={dateTimeStep as any}
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDueDate(selectedDate);
                      }
                    }}
                    style={styles.dateTimePicker}
                    textColor={theme.colors.dark}
                    themeVariant="light"
                    {...Platform.select({
                      ios: {
                        accentColor: theme.colors.primary,
                      },
                      android: {
                        backgroundColor: theme.colors.white,
                      },
                    })}
                  />

                  <View style={styles.dateTimeModalFooter}>
                    <TouchableOpacity
                      style={styles.dateTimeModalButton}
                      onPress={() => setDateTimeStep(null)}
                    >
                      <Text style={styles.dateTimeModalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.dateTimeModalButton, styles.dateTimeModalButtonPrimary]}
                      onPress={() => {
                        if (dateTimeStep === 'date') {
                          setDateTimeStep('time');
                        } else {
                          setDateTimeStep(null);
                        }
                      }}
                    >
                      <Text style={[styles.dateTimeModalButtonText, styles.dateTimeModalButtonTextPrimary]}>
                        {dateTimeStep === 'date' ? 'Next' : 'Done'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
  },
  handle: {
    width: wp(10),
    height: 4,
    backgroundColor: theme.colors.gray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: hp(1),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: hp(2),
    paddingHorizontal: hp(3),
  },
  title: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  closeButton: {
    padding: wp(2),
  },
  scrollView: {
    maxHeight: MODAL_HEIGHT - hp(20) - Platform.select({ ios: 0, android: StatusBar.currentHeight || 0 }),
  },
  content: {
    padding: hp(3),
    paddingTop: 0,
    gap: hp(3),
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: hp(1.5),
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.white,
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  dateTimeTextContainer: {
    gap: hp(0.2),
  },
  dateTimeLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  dateTimeValue: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  dateTimeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeModalContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    width: '90%',
    padding: hp(2),
    ...Platform.select({
      android: {
        elevation: 5,
      },
      ios: {
        shadowColor: theme.colors.dark,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  dateTimeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  dateTimeModalTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  dateTimePicker: {
    height: hp(25),
    backgroundColor: theme.colors.white,
  },
  dateTimeModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp(2),
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
  },
  dateTimeModalButton: {
    padding: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: theme.radius.sm,
  },
  dateTimeModalButtonPrimary: {
    backgroundColor: theme.colors.button,
  },
  dateTimeModalButtonText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  dateTimeModalButtonTextPrimary: {
    color: theme.colors.white,
  },
  label: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginBottom: hp(1),
  },
  priorityContainer: {
    gap: hp(1),
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: wp(2),
  },
  priorityButton: {
    flex: 1,
    padding: hp(1.2),
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray,
    alignItems: 'center',
  },
  priorityText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  footer: {
    padding: hp(3),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
  },
}); 