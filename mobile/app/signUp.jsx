import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useRef } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { FormInput } from '../components/FormInput'
import { MaterialIcons } from '@expo/vector-icons'
import { supabase } from '../lib/supabase'

export default function SignUp() {
  const router = useRouter();
  const emailRef = useRef("")
  const passwordRef = useRef("")
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if(!emailRef.current || !passwordRef.current){
      Alert.alert("Sign Up", "Please fill in all fields");
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    try {
      const { data: { session }, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      if (session) {
        router.push('/name');
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenWrapper>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton router={router} onPress={() => router.replace('welcome')}/>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Thryve</Text>
          <Text style={styles.subtitle}>Your journey to a better you starts here</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Let's</Text>
            <Text style={styles.welcomeText}>Get Started</Text>
          </View>

          <View style={styles.form}>
            <FormInput
              icon={<MaterialIcons name="email" size={24} color={theme.colors.textLight} />}
              placeholder="Email"
              onChangeText={(text) => emailRef.current = text}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              icon={<MaterialIcons name="lock" size={24} color={theme.colors.textLight} />}
              placeholder="Password"
              onChangeText={(text) => passwordRef.current = text}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={styles.signUpButton} 
              onPress={handleSignUp}
              activeOpacity={0.8}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Start Thryving'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <TouchableOpacity 
          style={styles.footer}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.footerText}>Already Thryving? </Text>
          <Text style={[styles.footerText, styles.footerLink]}>Log in</Text>
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
    marginTop: hp(6),
  },
  welcomeContainer: {
    marginBottom: hp(4),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    letterSpacing: -0.5,
  },
  form: {
    gap: hp(2.5),
  },
  signUpButton: {
    backgroundColor: theme.colors.button,
    padding: hp(2),
    borderRadius: theme.radius.sm,
    marginTop: hp(2),
  },
  signUpButtonText: {
    color: theme.colors.white,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    textAlign: 'center',
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