import React, { useState } from 'react';
import { View, StyleSheet, Alert,  Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { FormButton } from '../components/FormButton';
import { KeyboardAwareView } from '../components/KeyboardAwareView';
import { hp } from '../helpers/common';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // On successful login, navigate to the appropriate screen
      router.replace('/home');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAwareView>
        <View style={styles.container}>
          <View style={styles.content}>
            <Animated.Text 
              style={styles.header}
              entering={FadeIn.delay(200).springify()}
            >
              Welcome Back
            </Animated.Text>

            <View style={styles.form}>
              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                delay={300}
              />
              <InputField
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                returnKeyType="done"
                delay={400}
              />
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <FormButton
              title={loading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              disabled={loading}
            />

            <Animated.View 
              style={styles.signupContainer}
              entering={FadeIn.delay(600)}
            >
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signUp')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </KeyboardAwareView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: hp(4),
  },
  content: {
    flex: 1,
    gap: hp(6),
  },
  header: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },
  form: {
    gap: hp(3),
  },
  bottomContainer: {
    gap: hp(2),
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  signupLink: {
    fontSize: hp(1.6),
    color: theme.colors.button,
    fontWeight: theme.fonts.semibold,
  },
}); 