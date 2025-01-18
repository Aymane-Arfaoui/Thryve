import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import { hp, wp } from '../helpers/common';
import { theme } from '../constants/theme';
import { FormButton } from '../components/FormButton';
import Animated, { 
  FadeIn,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';

export default function CallScreen() {
  const router = useRouter();
  const pulseValue = useSharedValue(1);
  
  // Pulse animation for the icon
  useEffect(() => {
    pulseValue.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const handleRetry = () => {
    // Implement retry logic here
    console.log('Retrying call...');
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.dark} />
          <Text style={styles.backText}>Change number</Text>
        </TouchableOpacity>

        {/* Header Section */}
        <View style={styles.headerSection}>
          <Animated.Text 
            entering={FadeIn.delay(200).springify()}
            style={styles.title}
          >
            Your AI Coach is Calling!
          </Animated.Text>
          <Animated.Text 
            entering={FadeIn.delay(400).springify()}
            style={styles.subtitle}
          >
            Please pick up the call to set your goals and tasks.
          </Animated.Text>
        </View>

        {/* Icon Section */}
        <View style={styles.iconSection}>
          <Animated.View style={[styles.iconWrapper, pulseStyle]}>
            <Image 
              source={require('../assets/images/robot_icon.png')}
              style={styles.robotIcon}
              resizeMode="contain"
            />
          </Animated.View>
          
          {/* Calling Indicators */}
          <View style={styles.callingIndicators}>
            <MaterialIcons name="phone-in-talk" size={24} color={theme.colors.success} />
            <LoadingDots />
          </View>
          
          <Animated.Text 
            entering={FadeIn.delay(600).springify()}
            style={styles.statusText}
          >
            Connecting your AI Life Coach to discuss your goals...
          </Animated.Text>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={styles.retryText}>
            If you don't receive a call within 2 minutes, try again.
          </Text>
          <FormButton
            title="Retry"
            onPress={handleRetry}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}

// Loading dots component
function LoadingDots() {
  return (
    <View style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          entering={FadeIn.delay(400 + index * 200).springify()}
          style={styles.dot}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: hp(4),
  },
  headerSection: {
    alignItems: 'center',
    gap: hp(2),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.dark,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  iconSection: {
    alignItems: 'center',
    gap: hp(3),
  },
  iconWrapper: {
    width: wp(60),
    height: wp(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  robotIcon: {
    width: '100%',
    height: '100%',
  },
  callingIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: wp(1),
  },
  dot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: theme.colors.success,
    opacity: 0.6,
  },
  statusText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
    paddingHorizontal: wp(10),
  },
  footer: {
    alignItems: 'center',
    gap: hp(2),
  },
  retryText: {
    fontSize: hp(1.6),
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: hp(1),
    gap: wp(1),
  },
  backText: {
    fontSize: hp(1.6),
    color: theme.colors.dark,
    fontWeight: theme.fonts.medium,
  },
}); 