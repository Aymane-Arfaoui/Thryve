import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import LeftArrow from './LeftArrow'
import { theme } from '../../constants/theme'

const icons = {
    LeftArrow : LeftArrow
}

const Icon = ({name, ...props}) => {
    const IconComponents = icons[name];
  return (
    <IconComponents 
        height={props.size || 24}
        width={props.size || 24}
        strokeWidth={props.strokeWidth || 1.9}
        color={theme.colors.textLight}
        {...props}
    />
  )
}

export default Icon

const styles = StyleSheet.create({})