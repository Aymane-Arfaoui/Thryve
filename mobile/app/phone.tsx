import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { InputField } from '../components/InputField';
import { FormButton } from '../components/FormButton';
import { KeyboardAwareView } from '../components/KeyboardAwareView';
import { hp, wp } from '../helpers/common';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';

export default function PhoneScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const validatePhone = (number: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(number.replace(/\D/g, ''));
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format the number as user types
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

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
    setError(validatePhone(text) ? '' : 'Please enter a valid 10-digit phone number');
  };

  const isValid = validatePhone(phone.replace(/\D/g, ''));

  const handleNext = () => {
    if (isValid) {
      console.log('Phone:', `+1${phone.replace(/\D/g, '')}`);
      router.push('/call');
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
              What is your phone number?
            </Animated.Text>

            <View style={styles.form}>
              <View style={styles.phoneInputContainer}>
                <View style={styles.prefixContainer}>
                  <Text style={styles.prefix}>+1</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <InputField
                    label="Phone Number"
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="(555) 123-4567"
                    keyboardType="phone-pad"
                    returnKeyType="done"
                    maxLength={14} // (XXX) XXX-XXXX
                    error={error}
                    delay={300}
                  />
                </View>
              </View>
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: wp(2),
  },
  prefixContainer: {
    backgroundColor: theme.colors.gray,
    borderRadius: theme.radius.sm,
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    justifyContent: 'center',
    alignItems: 'center',
    height: hp(6),
  },
  prefix: {
    fontSize: hp(1.8),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
  inputWrapper: {
    flex: 1,
  },
}); 