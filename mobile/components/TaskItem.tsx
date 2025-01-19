import React from 'react';
import { StyleSheet, Text, Animated, View, TouchableOpacity, Pressable } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { MaterialIcons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface TaskProps {
  task: {
    id: string;
    name: string;
    dueDate: string;
    priority: string;
    completed: boolean;
  };
}

export function TaskItem({ task }: TaskProps) {
  const isGoal = task.priority === 'Duration';
  
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, wp(20)],
    });

    return (
      <Animated.View style={[styles.rightAction, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity onPress={() => {}} style={styles.completeButton}>
          <MaterialIcons name="check-circle" size={24} color={theme.colors.white} />
          <Text style={styles.completeText}>Complete</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      rightThreshold={40}
    >
      <Pressable 
        style={({ pressed }) => [
          styles.container,
          pressed && styles.pressed
        ]}
      >
        <View style={styles.content}>
          <View style={styles.mainContent}>
            <Text style={styles.taskName} numberOfLines={1}>{task.name}</Text>
            <View style={styles.timeContainer}>
              <MaterialIcons 
                name={isGoal ? 'track-changes' : 'event'} 
                size={16} 
                color={theme.colors.textLight}
              />
              <Text style={styles.timeInfo}>
                {task.priority}: {task.dueDate}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={() => {}}
            style={styles.completeIconButton}
          >
            <MaterialIcons 
              name={isGoal ? 'flag' : 'check-circle-outline'}
              size={24} 
              color={theme.colors.success}
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
  rightAction: {
    marginBottom: hp(1.5),
    marginLeft: wp(2),
  },
  completeButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(20),
    height: '100%',
    gap: hp(0.5),
  },
  completeText: {
    color: theme.colors.white,
    fontSize: hp(1.2),
    fontWeight: theme.fonts.medium,
  },
}); 