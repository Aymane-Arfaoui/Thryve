import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

function StatCard({ title, value, icon, color }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <MaterialIcons name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

export function HabitAnalyticsModal({ visible, onClose, habit }) {
  // Hardcoded analytics data for now
  const analytics = {
    currentStreak: 3,
    longestStreak: 7,
    totalCompletions: 15,
    completionRate: '85%',
    bestDay: 'Monday',
    worstDay: 'Saturday',
  };

  const weeklyBreakdown = [
    { day: 'Mon', rate: 90 },
    { day: 'Tue', rate: 85 },
    { day: 'Wed', rate: 75 },
    { day: 'Thu', rate: 80 },
    { day: 'Fri', rate: 70 },
    { day: 'Sat', rate: 60 },
    { day: 'Sun', rate: 65 },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Statistics</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.statsGrid}>
              <StatCard
                title="Current Streak"
                value={`${analytics.currentStreak} days`}
                icon="local-fire-department"
                color={theme.colors.orange}
              />
              <StatCard
                title="Longest Streak"
                value={`${analytics.longestStreak} days`}
                icon="emoji-events"
                color={theme.colors.warning}
              />
              <StatCard
                title="Completion Rate"
                value={analytics.completionRate}
                icon="pie-chart"
                color={theme.colors.success}
              />
              <StatCard
                title="Total Completions"
                value={analytics.totalCompletions}
                icon="check-circle"
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
              <View style={styles.weeklyStats}>
                {weeklyBreakdown.map((day) => (
                  <View key={day.day} style={styles.dayStats}>
                    <View style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { height: `${day.rate}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.dayLabel}>{day.day}</Text>
                    <Text style={styles.dayRate}>{day.rate}%</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.insightCard}>
                <Text style={styles.insightText}>
                  🎯 Best day: {analytics.bestDay}
                </Text>
                <Text style={styles.insightText}>
                  ⚠️ Needs improvement: {analytics.worstDay}
                </Text>
              </View>
            </View>
          </ScrollView>
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
    maxHeight: '90%',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: wp(2),
    marginBottom: hp(3),
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    width: '47%',
    backgroundColor: theme.colors.white,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  iconContainer: {
    padding: wp(2),
    borderRadius: theme.radius.full,
  },
  statValue: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
  },
  statTitle: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
  },
  section: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(2),
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp(20),
    paddingBottom: hp(3),
  },
  dayStats: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: '100%',
    width: wp(6),
    backgroundColor: theme.colors.gray + '20',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.full,
  },
  dayLabel: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    marginTop: hp(1),
  },
  dayRate: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    marginTop: hp(0.5),
  },
  insightCard: {
    backgroundColor: theme.colors.white,
    padding: hp(2),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
  },
  insightText: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
    marginBottom: hp(1),
  },
}); 