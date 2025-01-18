import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { FormInput } from '../components/FormInput'
import { MaterialIcons } from '@expo/vector-icons'

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('Logging in with:', email, password);
  };

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} onPress={() => router.replace('welcome')}/>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Continue your journey with Thryve</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.form}>
            <FormInput
              icon={<MaterialIcons name="email" size={24} color={theme.colors.textLight} />}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              icon={<MaterialIcons name="lock" size={24} color={theme.colors.textLight} />}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={() => router.push('/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity 
          style={styles.footer}
          onPress={() => router.push('/signUp')}
        >
          <Text style={styles.footerText}>New to Thryve? </Text>
          <Text style={[styles.footerText, styles.footerLink]}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  title: {
    fontSize: hp(4.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    marginTop: hp(1),
  },
  formSection: {
    flex: 1,
    marginTop: hp(8),
  },
  form: {
    gap: hp(2.5),
  },
  loginButton: {
    backgroundColor: theme.colors.button,
    padding: hp(2),
    borderRadius: theme.radius.sm,
    marginTop: hp(2),
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    textAlign: 'center',
  },
  forgotPassword: {
    alignItems: 'center',
    marginTop: hp(2),
  },
  forgotPasswordText: {
    color: theme.colors.button,
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: hp(4),
  },
  footerText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  footerLink: {
    color: theme.colors.button,
    fontWeight: theme.fonts.semibold,
  },
}); 