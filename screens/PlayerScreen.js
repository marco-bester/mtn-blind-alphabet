import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from 'expo-router/react-navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import QRScannerModal from '../components/QRScannerModal';
import TopBar from '../components/TopBar';
import { IconSymbol } from '../components/ui/icon-symbol';
import { useQRScanner } from '../hooks/useQRScanner';
import parseQrPayload from '../utils/parseQrPayload';
import { getSongByTitle } from '../utils/songCatalog';

export default function PlayerScreen() {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions();
  const compactHeight = height < 500;
  const wideLayout = width >= 700;
  const insets = useSafeAreaInsets();
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

  const goHome = () => {
    player.pause();
    AccessibilityInfo.announceForAccessibility('Returning home.');
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <TopBar />

      <ScrollView contentContainerStyle={[styles.content, compactHeight && styles.compactContent, wideLayout && styles.wideContent]}>
        <View style={[styles.trackInfo, compactHeight && styles.compactTrackInfo, wideLayout && styles.wideTrackInfo]}>
          <Text style={[styles.header, compactHeight && styles.compactHeader, { color: colors.primary }]} accessibilityRole="header" allowFontScaling>
            {isPlaying ? 'NOW PLAYING' : 'READY TO LISTEN'}
          </Text>

          <Text
            style={[styles.title, compactHeight && styles.compactTitle, { color: colors.text, fontSize: compactHeight ? 34 : width < 360 ? 44 : 52 }]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`Song title: ${displayTitle}`}
            allowFontScaling
          >
            {displayTitle}
          </Text>
          <View style={[styles.rule, { backgroundColor: colors.primary }]} accessible={false} />
        </View>

        <View style={[styles.controls, wideLayout && styles.wideControls]}>
          <Pressable
            onPress={togglePlay}
            style={({ pressed }) => [styles.button, compactHeight && styles.compactButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause song' : 'Play song'}
            accessibilityHint={isPlaying ? 'Pauses the current song' : 'Resumes the current song'}
          >
            <Text style={[styles.buttonText, compactHeight && styles.compactButtonText, { color: colors.background }]} allowFontScaling>
              {isPlaying ? 'Pause' : 'Play'}
            </Text>
          </Pressable>

          <Pressable
            onPress={scanAnother}
            style={({ pressed }) => [styles.secondary, compactHeight && styles.compactSecondary, { borderColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Scan another song"
            accessibilityHint="Opens the QR scanner to scan a new song"
          >
            <Text style={[styles.secondaryText, compactHeight && styles.compactSecondaryText, { color: colors.primary }]} allowFontScaling>
              Scan another song
            </Text>
          </Pressable>

          {!ready && (
            <Text style={[styles.loading, { color: colors.text }]} accessibilityLiveRegion="polite" allowFontScaling>
              Loading audio…
            </Text>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={goHome}
        style={({ pressed }) => [
          styles.homeFooter,
          {
            borderTopColor: colors.primary,
            backgroundColor: colors.background,
            paddingBottom: Math.max(insets.bottom, 4),
            opacity: pressed ? 0.82 : 1,
          },
        ]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Home"
        accessibilityHint="Stops the current song and returns to the Home screen"
      >
        <IconSymbol name="house.fill" size={22} color={String(colors.primary)} />
        <Text style={[styles.homeFooterLabel, { color: colors.primary }]} allowFontScaling>
          Home
        </Text>
      </Pressable>

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
  compactContent: { paddingBottom: 6 },
  wideContent: { maxWidth: 720, alignSelf: 'center' },
  trackInfo: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 36 },
  compactTrackInfo: { paddingVertical: 8 },
  wideTrackInfo: { maxWidth: 800, width: '100%', alignSelf: 'center' },
  header: { fontSize: 15, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  compactHeader: { fontSize: 13, marginBottom: 8 },
  title: { fontWeight: '900', textAlign: 'center', marginBottom: 24 },
  compactTitle: { marginBottom: 10 },
  rule: { width: 76, height: 8, borderRadius: 4, alignSelf: 'center' },
  controls: { alignItems: 'center', gap: 14 },
  wideControls: { width: '100%', maxWidth: 640, alignSelf: 'center' },
  button: {
    width: '100%',
    minHeight: 84,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactButton: { minHeight: 58, paddingVertical: 10 },
  buttonText: { fontSize: 26, fontWeight: '900', textAlign: 'center' },
  compactButtonText: { fontSize: 22 },
  secondary: {
    width: '100%',
    minHeight: 72,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  compactSecondary: { minHeight: 54, paddingVertical: 8 },
  secondaryText: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  compactSecondaryText: { fontSize: 17 },
  homeFooter: {
    minHeight: 62,
    paddingTop: 5,
    borderTopWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeFooterLabel: { fontSize: 13, fontWeight: '900', textAlign: 'center' },
  loading: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
});