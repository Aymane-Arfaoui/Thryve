import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'

const _layout = () => {
    const router = useRouter();
    useEffect(()=>{
        router.replace('welcome')
    })
  return (
    <Stack
        screenOptions={{
                headerShown: false
            }}
    />
  )
}

export default _layout

const styles = StyleSheet.create({})