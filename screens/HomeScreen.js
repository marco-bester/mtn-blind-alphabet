import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'expo-router/react-navigation';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRScannerModal from '../components/QRScannerModal';
import TopBar from '../components/TopBar';
import { useQRScanner } from '../hooks/useQRScanner';
import parseQrPayload from '../utils/parseQrPayload';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const compactHeight = height < 500;
  const wideLayout = width >= 700;
  const router = useRouter();
  const { autoScan } = useLocalSearchParams();
  const { scannerVisible, scanned, setScanned, openScanner, closeScanner } = useQRScanner();
  
  const announceOnceRef = useRef(false);
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    // Announce screen for screen readers
    if (!announceOnceRef.current) {
      AccessibilityInfo.announceForAccessibility('Home. MTN Blind Alphabet. Double tap Scan to scan a song QR code.');
      announceOnceRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!autoScan || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    openScanner();
  }, [autoScan, openScanner]);

  const onBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const { title, url } = parseQrPayload(data);
      closeScanner();
      AccessibilityInfo.announceForAccessibility(`Scanned. Loading ${title}.`);
      router.push({ pathname: '/player', params: url ? { title, url } : { title } });
    } catch (e) {
      closeScanner();
      // Only Alert is needed as VoiceOver auto-reads alerts
      Alert.alert('Invalid QR', e.message || 'This QR code is not a valid song.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <TopBar />

      <ScrollView contentContainerStyle={[styles.content, wideLayout && styles.wideContent]}>
        <View style={[styles.hero, compactHeight && styles.compactHero]}>
          <Text style={[styles.eyebrow, compactHeight && styles.compactEyebrow, { color: colors.primary }]} allowFontScaling>
            MTN ACCESSIBILITY
          </Text>
          <Text
            style={[styles.title, compactHeight && styles.compactTitle, { color: colors.text, fontSize: compactHeight ? 36 : width < 360 ? 44 : 52 }]}
            accessibilityRole="header"
            allowFontScaling
          >
            Blind{'\n'}Alphabet
          </Text>
          <View style={[styles.rule, { backgroundColor: colors.primary }]} accessible={false} />
        </View>

        <Pressable
          onPress={openScanner}
          style={({ pressed }) => [styles.button, compactHeight && styles.compactButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Scan a song QR code"
          accessibilityHint="Opens the camera to scan a QR code that links to a song"
        >
          <Text style={[styles.buttonText, compactHeight && styles.compactButtonText, { color: colors.background }]} allowFontScaling>
            Scan a song
          </Text>
          <Text style={[styles.buttonSubtext, compactHeight && styles.compactButtonSubtext, { color: colors.background }]} allowFontScaling>
            QR CODE
          </Text>
        </Pressable>
      </ScrollView>

      <QRScannerModal
        visible={scannerVisible}
        scanned={scanned}
        onBarCodeScanned={onBarCodeScanned}
        onClose={closeScanner}
      />
    </SafeAreaView>
  );
}

const MIN_TOUCH = 48;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, width: '100%', paddingHorizontal: 24, paddingBottom: 24 },
  wideContent: { maxWidth: 640, alignSelf: 'center' },
  hero: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 36 },
  compactHero: { paddingVertical: 10 },
  eyebrow: { fontSize: 15, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  compactEyebrow: { fontSize: 13, marginBottom: 8 },
  title: { fontWeight: '900', textAlign: 'center', marginBottom: 24 },
  compactTitle: { marginBottom: 10 },
  rule: { width: 76, height: 8, borderRadius: 4, alignSelf: 'center' },
  button: {
    width: '100%',
    minHeight: 84,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  compactButton: { minHeight: 60, paddingVertical: 10, marginBottom: 4 },
  buttonText: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  compactButtonText: { fontSize: 20 },
  buttonSubtext: { fontSize: 13, fontWeight: '800', textAlign: 'center', marginTop: 2 },
  compactButtonSubtext: { fontSize: 11 },
});