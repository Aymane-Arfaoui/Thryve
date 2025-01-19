import React from 'react';
import { StyleSheet, Text, Animated, View, TouchableOpacity, Pressable, Alert } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface TaskProps {
  task: {
    id: string;
    name: string;
    dueDate: string;
    priority: string;
    completed: boolean;
  };
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

function isOverdue(dateString: string): boolean {
  try {
    if (!dateString || dateString === 'Invalid Date') return false;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const now = new Date();
    return date.getTime() < now.getTime();
  } catch (error) {
    console.log('Error checking if overdue:', error);
    return false;
  }
}

function formatDueDate(dateString: string, isGoal: boolean): string {
  if (isGoal) {
    return dateString;
  }

  try {
    if (!dateString || dateString === 'Invalid Date') return 'No due date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    if (date.getTime() < now.getTime()) {
      if (isToday(date)) {
        return `Overdue - ${format(date, 'h:mm a')}`;
      }
      return `Overdue - ${format(date, 'MMM d, yyyy')}`;
    }

    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    }
    if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    console.log('Error formatting date:', error, 'for date:', dateString);
    return 'Invalid date';
  }
}

export function TaskItem({ task, onComplete, onDelete }: TaskProps) {
  if (!task || typeof task !== 'object') return null;

  const isGoal = task?.priority?.toString() === 'Duration';
  const taskIsOverdue = !isGoal && task?.dueDate ? isOverdue(task.dueDate) : false;
  
  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: () => onDelete(task.id),
          style: "destructive"
        }
      ]
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-20, 0, 0],
    });
    
    return (
      <Animated.View style={[styles.leftAction, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={24} color={theme.colors.white} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderLeftActions={renderLeftActions}
      friction={2}
      leftThreshold={100}
    >
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed,
          taskIsOverdue && styles.overdueContainer
        ]}
      >
        <View style={styles.content}>
          <View style={styles.mainContent}>
            <Text style={[
              styles.taskName,
              taskIsOverdue && styles.overdueText
            ]} numberOfLines={1}>
              {task?.name?.toString() || ''}
            </Text>
            <View style={styles.timeContainer}>
              <MaterialIcons 
                name={isGoal ? 'track-changes' : 'event'} 
                size={16} 
                color={taskIsOverdue ? theme.colors.error : theme.colors.textLight}
              />
              <Text style={[
                styles.timeInfo,
                taskIsOverdue && styles.overdueText
              ]}>
                {task?.priority?.toString() || ''} • {formatDueDate(task?.dueDate || '', isGoal)}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => onComplete(task.id)}
            style={styles.completeIconButton}
          >
            <MaterialIcons 
              name="check-circle-outline"
              size={24} 
              color={taskIsOverdue ? theme.colors.error : theme.colors.success}
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    marginBottom: hp(1.5),
    padding: hp(2),
    ...theme.shadows.sm,
  },
  pressed: {
    opacity: 0.9,
    backgroundColor: theme.colors.gray + '20',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    gap: hp(0.8),
    marginRight: wp(3),
  },
  taskName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.dark,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  timeInfo: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  completeIconButton: {
    padding: wp(2),
  },
  leftAction: {
    marginBottom: hp(1.5),
    marginRight: wp(2),
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(20),
    height: '100%',
    gap: hp(0.5),
  },
  deleteText: {
    color: theme.colors.white,
    fontSize: hp(1.2),
    fontWeight: theme.fonts.medium,
  },
  overdueContainer: {
    backgroundColor: theme.colors.error + '10',
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  overdueText: {
    color: theme.colors.error,
  },
}); 