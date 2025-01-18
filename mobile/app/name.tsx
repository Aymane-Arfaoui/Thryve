import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { FormButton } from '../components/FormButton';
import { KeyboardAwareView } from '../components/KeyboardAwareView';
import { hp } from '../helpers/common';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';

export default function NameScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const isValid = firstName.trim() !== '' && lastName.trim() !== '';

  const handleNext = () => {
    if (isValid) {
      console.log('Name:', { firstName, lastName });
      router.push('/phone');
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
            title="Next"
            onPress={handleNext}
            disabled={!isValid}
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