import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

export function PopupMenu({ visible, onClose, position, options }) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.menuContainer, position]}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.menuItem,
                  index === options.length - 1 && styles.lastMenuItem,
                  option.destructive && styles.destructiveItem
                ]}
                onPress={() => {
                  onClose();
                  option.onPress();
                }}
              >
                <MaterialIcons
                  name={option.icon}
                  size={20}
                  color={option.destructive ? theme.colors.error : theme.colors.dark}
                />
                <Text style={[
                  styles.menuText,
                  option.destructive && styles.destructiveText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menuContainer: {
    position: 'absolute',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    padding: hp(0.5),
    minWidth: wp(40),
    ...theme.shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hp(1.2),
    gap: wp(2),
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  destructiveItem: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray + '20',
  },
  menuText: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
  },
  destructiveText: {
    color: theme.colors.error,
  },
}); 