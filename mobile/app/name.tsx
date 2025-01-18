import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { FormButton } from '../components/FormButton';
import { KeyboardAwareView } from '../components/KeyboardAwareView';
import { hp } from '../helpers/common';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { supabase } from '../lib/supabase';

export default function NameScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = firstName.trim() !== '' && lastName.trim() !== '';

  const handleNext = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert("Error", "No authenticated user found");
        router.replace('/signUp');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`
        }
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      router.push('/phone');
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
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
              What is your name?
            </Animated.Text>

            <View style={styles.form}>
              <InputField
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                autoCapitalize="words"
                returnKeyType="next"
                delay={300}
              />
              <InputField
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                autoCapitalize="words"
                returnKeyType="done"
                delay={400}
              />
            </View>
          </View>

          <FormButton
            title={loading ? "Saving..." : "Next"}
            onPress={handleNext}
            disabled={!isValid || loading}
          />
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
}); 