import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { FormButton } from '../components/FormButton';
import { KeyboardAwareView } from '../components/KeyboardAwareView';
import { hp, wp } from '../helpers/common';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useFirebaseUser } from '../lib/firebase/hooks/useFirebaseUser';
import { initiateCall } from '../services/userService';


export default function SignUpScreen() {
  const router = useRouter();
  const { createUserDocument } = useFirebaseUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs for input fields to handle next field focus
  const lastNameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const validatePhone = (number) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 3) {
        formatted = `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      } else {
        formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
    }
    return formatted;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName || !validatePhone(phone)) {
      Alert.alert('Error', 'Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = `+1${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
            phone_number: formattedPhone
          }
        }
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      // Create Firebase user document
      const firebaseSuccess = await createUserDocument(data.user.id);
      if (!firebaseSuccess) {
        Alert.alert(
          'Warning', 
          'Account created but there was an issue setting up your profile. Please contact support.'
        );
      }
      await initiateCall(data.user.id, "setup_bot")

      router.push('/login');      // Schedule a call for the user
      
      
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
              Create Account
            </Animated.Text>

            <View style={styles.form}>
              <InputField
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
                blurOnSubmit={false}
                delay={300}
              />
              <InputField
                ref={lastNameRef}
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                blurOnSubmit={false}
                delay={400}
              />
              
              <InputField
                ref={phoneRef}
                label="Phone Number"
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                returnKeyType="next"
                maxLength={14}
                onSubmitEditing={() => emailRef.current?.focus()}
                blurOnSubmit={false}
                delay={500}
              />

              <InputField
                ref={emailRef}
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
                delay={600}
              />
              <InputField
                ref={passwordRef}
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
                delay={700}
              />
            </View>
          </View>

          <View style={styles.bottomContainer}>
            <FormButton
              title={loading ? "Creating Account..." : "Sign Up"}
              onPress={handleSignUp}
              disabled={loading}
            />

            <Animated.View 
              style={styles.loginContainer}
              entering={FadeIn.delay(600)}
            >
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.loginLink}>Login</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
  },
  loginLink: {
    fontSize: hp(1.6),
    color: theme.colors.button,
    fontWeight: theme.fonts.semibold,
  },
});