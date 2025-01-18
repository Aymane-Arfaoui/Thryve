import { TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons } from '@expo/vector-icons'
import { theme } from '../constants/theme'

export default function BackButton({ router, onPress }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.dark} />
    </TouchableOpacity>
  )
}