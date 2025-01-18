import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { wp } from '../helpers/common';

export default function ScreenWrapper({ children }) {
  const { top } = useSafeAreaInsets();
  const paddingTop = top > 0 ? top + 5 : top + 30;

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
});