import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import QRScannerModal from '../components/QRScannerModal';
import TopBar from '../components/TopBar';
import { useQRScanner } from '../hooks/useQRScanner';
import parseQrPayload from '../utils/parseQrPayload';

export default function HomeScreen() {
  const { colors } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />

      <View style={styles.centerContent}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header" allowFontScaling>
          MTN Blind Alphabet
        </Text>

        <Pressable
          onPress={openScanner}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Scan a song QR code"
          accessibilityHint="Opens the camera to scan a QR code that links to a song"
        >
          <Text style={[styles.buttonText, { color: colors.background }]} allowFontScaling>
            Scan a QR Code
          </Text>
        </Pressable>
      </View>

      <QRScannerModal
        visible={scannerVisible}
        scanned={scanned}
        onBarCodeScanned={onBarCodeScanned}
        onClose={closeScanner}
      />
    </View>
  );
}

const MIN_TOUCH = 48;

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', padding: 24, paddingTop: 24 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 32 },
  button: {
    minWidth: 240,
    minHeight: MIN_TOUCH,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonText: { fontSize: 18, fontWeight: '800' }
});