import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../constants/theme';

interface CircularProgressProps {
  value: number;
  radius: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}

export function CircularProgress({ 
  value, 
  radius, 
  strokeWidth, 
  color = theme.colors.primary,
  backgroundColor = theme.colors.gray + '20'
}: CircularProgressProps) {
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (progressValue / 100) * circumference;

  return (
    <View style={styles.container}>
      <Svg width={radius * 2} height={radius * 2}>
        {/* Background Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth / 2}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 