import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

interface FormInputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export function FormInput({ icon, ...props }: FormInputProps) {
  return (
    <View style={styles.inputContainer}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <TextInput
        style={[styles.input, icon && styles.inputWithIcon]}
        placeholderTextColor={theme.colors.textLight}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.white,
  },
  iconContainer: {
    paddingLeft: wp(4),
  },
  input: {
    flex: 1,
    padding: wp(3.5),
    fontSize: hp(1.8),
    color: theme.colors.dark,
  },
  inputWithIcon: {
    paddingLeft: wp(2),
  },
}); 