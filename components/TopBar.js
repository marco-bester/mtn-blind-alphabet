import { useTheme } from '@react-navigation/native';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function TopBar() {
  const { colors } = useTheme();

  return (
    <View style={styles.topBar}>
      <Text style={[styles.topBarTitle, { color: colors.text }]} accessibilityRole="header" allowFontScaling>
        Blind Alphabet
      </Text>
      <View style={styles.topBarLogos}>
        <View accessible accessibilityRole="image" accessibilityLabel="MTN Blind Alphabet logo">
          <Image
            source={require('../assets/mtn.jpg')}
            style={styles.topLogoImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
        <View accessible accessibilityRole="image" accessibilityLabel="University of Johannesburg logo">
          <Image
            source={require('../assets/university-of-joburg.jpg')}
            style={styles.topLogoImage}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  topBarTitle: { fontSize: 18, fontWeight: '800' },
  topBarLogos: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topLogoImage: { width: 60, height: 44 },
});