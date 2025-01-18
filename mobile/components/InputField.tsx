import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
  delay?: number;
}

export function InputField({ label, error, delay = 0, ...props }: InputFieldProps) {
  return (
    <Animated.View 
      style={styles.container}
      entering={SlideInRight.delay(delay).springify()}
    >
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
      {error && (
        <Animated.Text 
          style={styles.errorText}
          entering={FadeIn}
        >
          {error}
        </Animated.Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: hp(1),
  },
  label: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    fontWeight: theme.fonts.medium,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    padding: hp(1.5),
    fontSize: hp(1.8),
    color: theme.colors.dark,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: hp(1.4),
    color: theme.colors.error,
  },
}); 