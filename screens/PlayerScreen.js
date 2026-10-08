import { useTheme } from '@react-navigation/native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import QRScannerModal from '../components/QRScannerModal';
import TopBar from '../components/TopBar';
import { useQRScanner } from '../hooks/useQRScanner';
import parseQrPayload from '../utils/parseQrPayload';
import { getSongByTitle } from '../utils/songCatalog';

export default function PlayerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { title, url } = useLocalSearchParams();
  const titleText = Array.isArray(title) ? title[0] : title || '';
  const urlText = Array.isArray(url) ? url[0] : url || '';
  const song = useMemo(() => getSongByTitle(titleText), [titleText]);
  const displayTitle = song?.title || titleText;
  const audioSource = useMemo(() => {
    if (song?.source) return song.source;
    if (urlText) return { uri: urlText };
    return null;
  }, [song, urlText]);
  
  const player = useAudioPlayer(audioSource, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);
  const [ready, setReady] = useState(false);
  const hasStartedRef = useRef(false);
  const hasErrorAlertedRef = useRef(false);

  const { scannerVisible, scanned, setScanned, openScanner, closeScanner } = useQRScanner();

  useEffect(() => {
    hasStartedRef.current = false;
    hasErrorAlertedRef.current = false;
    setReady(false);
  }, [audioSource]);

  useEffect(() => {
    if (!audioSource && !hasErrorAlertedRef.current) {
      hasErrorAlertedRef.current = true;
      Alert.alert('Song not found', 'Please check the QR code title and try again.');
      setReady(true);
      return;
    }

    if (!audioSource) return;

    if (status?.error && !hasErrorAlertedRef.current) {
      hasErrorAlertedRef.current = true;
      Alert.alert('Audio error', String(status.error));
      setReady(true);
      return;
    }

    if (status.isLoaded) {
      setReady(true);
      if (!hasStartedRef.current) {
        hasStartedRef.current = true;
        player.play();
        AccessibilityInfo.announceForAccessibility(`Playing: ${displayTitle}`);
      }
    }
  }, [audioSource, status.isLoaded, status.error, player, displayTitle]);

  // Handle load timeout
  useEffect(() => {
    if (!audioSource || status.isLoaded || hasErrorAlertedRef.current) return;
    const timeout = setTimeout(() => {
      if (!hasErrorAlertedRef.current) {
        hasErrorAlertedRef.current = true;
        Alert.alert('Audio failed to load', 'Please check the QR code and try again.');
        setReady(true);
      }
    }, 6000);
    return () => clearTimeout(timeout);
  }, [audioSource, status.isLoaded]);

  useEffect(() => {
    if (status.didJustFinish) {
      AccessibilityInfo.announceForAccessibility('Playback finished.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [status.didJustFinish]);

  const isPlaying = status.playing;

  const togglePlay = async () => {
    if (!status.isLoaded) return;
    if (isPlaying) {
      player.pause();
      AccessibilityInfo.announceForAccessibility('Paused.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      player.play();
      AccessibilityInfo.announceForAccessibility('Playing.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const onBarCodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const { title: newTitle, url: newUrl } = parseQrPayload(data);
      closeScanner();
      player.pause();
      AccessibilityInfo.announceForAccessibility(`Scanned. Loading ${newTitle}.`);
      router.replace({ pathname: '/player', params: newUrl ? { title: newTitle, url: newUrl } : { title: newTitle } });
    } catch (e) {
      closeScanner();
      Alert.alert('Invalid QR', e.message || 'This QR code is not a valid song.');
    }
  };

  const scanAnother = async () => {
    AccessibilityInfo.announceForAccessibility('Opening scanner.');
    await openScanner();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      
      <View style={styles.centerContent}>
        <Text
          style={[styles.header, { color: colors.text }]}
          accessibilityRole="header"
          allowFontScaling
        >
          Now Playing
        </Text>

        <Text
          style={[styles.title, { color: colors.text }]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={`Title: ${displayTitle}`}
          allowFontScaling
        >
          {displayTitle}
        </Text>

        <Pressable
          onPress={togglePlay}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          accessibilityHint={isPlaying ? 'Pauses the current song' : 'Resumes the current song'}
        >
          <Text style={[styles.buttonText, { color: colors.background }]} allowFontScaling>
            {isPlaying ? 'Pause' : 'Play'}
          </Text>
        </Pressable>

        <Pressable
          onPress={scanAnother}
          style={({ pressed }) => [styles.secondary, { borderColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Scan another song"
          accessibilityHint="Opens the QR scanner to scan a new song"
        >
          <Text style={[styles.secondaryText, { color: colors.primary }]} allowFontScaling>
            Scan Another Song
          </Text>
        </Pressable>

        {!ready && (
          <Text style={{ color: colors.text, marginTop: 16 }} accessibilityLiveRegion="polite" allowFontScaling>
            Loading audio…
          </Text>
        )}
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
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  button: {
    minWidth: 220,
    minHeight: MIN_TOUCH,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  buttonText: { fontSize: 18, fontWeight: '800' },
  secondary: {
    minWidth: 220,
    minHeight: MIN_TOUCH,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  secondaryText: { fontSize: 16, fontWeight: '800' }
});