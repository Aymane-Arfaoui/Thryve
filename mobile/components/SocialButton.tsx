import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

interface SocialButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

export function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: wp(3),
    paddingHorizontal: wp(5),
    borderRadius: wp(2),
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: `${theme.colors.border}80`,
    gap: wp(2),
    shadowColor: theme.colors.text,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
}); 