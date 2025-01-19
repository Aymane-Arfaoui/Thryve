import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { format } from 'date-fns';

function StatCard({ title, value, icon, color }) {
  return (
    <View style={styles.statCard}>
      <MaterialIcons 
        name={icon} 
        size={20} 
        color={color} 
        style={styles.statIcon}
      />
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.statTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

export function HabitAnalyticsModal({ visible, onClose, habit }) {
  const analytics = useMemo(() => {
    if (!habit) return null;

    // Calculate total completions
    const totalCompletions = Object.values(habit.progress || {})
      .filter(p => p.completed).length;

    // Calculate completion rate
    const totalDays = Object.keys(habit.progress || {}).length;
    const completionRate = totalDays ? 
      Math.round((totalCompletions / totalDays) * 100) : 0;

    // Calculate daily stats
    const dayStats = {
      mon: { total: 0, completed: 0 },
      tue: { total: 0, completed: 0 },
      wed: { total: 0, completed: 0 },
      thu: { total: 0, completed: 0 },
      fri: { total: 0, completed: 0 },
      sat: { total: 0, completed: 0 },
      sun: { total: 0, completed: 0 },
    };

    // Analyze progress by day of week
    Object.entries(habit.progress || {}).forEach(([dateStr, data]) => {
      // Parse the date string directly and get the day
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day); // month is 0-based in JS
      const dayName = format(date, 'eee').toLowerCase();
      
      dayStats[dayName].total++;
      if (data.completed) {
        dayStats[dayName].completed++;
      }
    });

    // Calculate completion rates by day
    const weeklyBreakdown = Object.entries(dayStats).map(([day, stats]) => ({
      day: day.charAt(0).toUpperCase() + day.slice(1, 3),
      rate: stats.total ? Math.round((stats.completed / stats.total) * 100) : 0
    }));

    // Find best and worst days
    const dayRates = Object.entries(dayStats)
      .map(([day, stats]) => ({
        day,
        rate: stats.total ? (stats.completed / stats.total) : 0
      }))
      .sort((a, b) => b.rate - a.rate);

    const bestDay = dayRates[0]?.day;
    const worstDay = dayRates[dayRates.length - 1]?.day;

    return {
      currentStreak: habit.currentStreak,
      longestStreak: habit.longestStreak,
      totalCompletions,
      completionRate: `${completionRate}%`,
      bestDay: bestDay ? bestDay.charAt(0).toUpperCase() + bestDay.slice(1) : 'N/A',
      worstDay: worstDay ? worstDay.charAt(0).toUpperCase() + worstDay.slice(1) : 'N/A',
      weeklyBreakdown
    };
  }, [habit]);

  if (!analytics) return null;

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
            <View style={styles.content}>
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
                  value={analytics.totalCompletions.toString()}
                  icon="check-circle"
                  color={theme.colors.success}
                />
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Weekly Breakdown</Text>
                <View style={styles.weeklyStats}>
                  {analytics.weeklyBreakdown.map((day) => (
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
                  <View style={styles.insightRow}>
                    <MaterialIcons 
                      name="trending-up" 
                      size={20} 
                      color={theme.colors.success} 
                    />
                    <Text style={styles.insightText}>
                      Best day: {analytics.bestDay}
                    </Text>
                  </View>
                  <View style={styles.insightRow}>
                    <MaterialIcons 
                      name="trending-down" 
                      size={20} 
                      color={theme.colors.warning} 
                    />
                    <Text style={styles.insightText}>
                      Needs improvement: {analytics.worstDay}
                    </Text>
                  </View>
                </View>
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
    paddingTop: hp(3),
    maxHeight: '90%',
  },
  content: {
    paddingHorizontal: hp(2),
    paddingBottom: hp(4),
    paddingTop: hp(1),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
    paddingHorizontal: hp(3),
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
    paddingHorizontal: wp(1),
  },
  statCard: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '48%',
    backgroundColor: theme.colors.white,
    padding: hp(1),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray + '20',
    minHeight: hp(8),
  },
  statIcon: {
    marginBottom: hp(0.3),
  },
  statTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statValue: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    lineHeight: hp(1.8),
    textAlign: 'center',
  },
  statTitle: {
    fontSize: hp(1.2),
    color: theme.colors.textLight,
    lineHeight: hp(1.4),
    textAlign: 'center',
  },
  section: {
    marginBottom: hp(4),
  },
  sectionTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.dark,
    marginBottom: hp(2),
    paddingLeft: wp(1),
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: hp(20),
    paddingVertical: hp(2),
    paddingHorizontal: wp(3),
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray + '20',
  },
  dayStats: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barContainer: {
    height: '75%',
    width: wp(6),
    backgroundColor: theme.colors.success + '15',
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: theme.colors.success + '20',
  },
  bar: {
    width: '100%',
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.full,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: hp(1.4),
    color: theme.colors.dark,
    marginTop: hp(1),
    fontWeight: theme.fonts.medium,
    textAlign: 'center',
  },
  dayRate: {
    fontSize: hp(1.2),
    color: theme.colors.success,
    marginTop: hp(0.5),
    fontWeight: theme.fonts.medium,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: theme.colors.white,
    padding: hp(2.5),
    borderRadius: theme.radius.lg,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.gray + '20',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    paddingVertical: hp(1),
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray + '10',
  },
  insightText: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
    flex: 1,
    lineHeight: hp(2.2),
  },
}); 