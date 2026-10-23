import { Stack, useRouter } from 'expo-router';
import { useTheme } from 'expo-router/react-navigation';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '../components/TopBar';

const sections = [
  {
    title: 'Who is responsible',
    body: 'Blind Alphabet is published by Marco Bester. For privacy questions or requests, email marcobester@gmail.com.',
  },
  {
    title: 'Camera and QR codes',
    body: 'The camera is used only after you choose Scan a song. The live camera view is used on your device to recognize a QR code. The app does not record or upload camera images or video. The QR content is handled on your device to open the matching audio or catalog entry. Camera access is optional; scanning is unavailable if you deny it.',
  },
  {
    title: 'Audio and network requests',
    body: 'The app requests the song catalog and audio from Google Firebase Storage over HTTPS. A QR code may also contain a direct audio URL; in that case your device contacts that URL to retrieve the audio. The relevant service may receive ordinary connection information such as your IP address, request details, and device/network metadata. The app does not create an account or send your name, email, or camera feed to these services.',
  },
  {
    title: 'Data use and sharing',
    body: 'The app does not include an account system or advertising. The publisher does not operate a separate analytics service or sell personal information. Google Firebase processes requests as the storage provider; a third-party server may process requests when you scan a QR code containing its audio URL. Those providers handle their own service logs under their published terms and privacy notices.',
  },
  {
    title: 'Android scanner diagnostics',
    body: "On Android, QR scanning uses Google's ML Kit SDK. Google documents collection of device and app information, per-installation identifiers, performance metrics, API configuration, input and output sizes, feature versions, event types, and error codes for diagnostics and usage analytics. This technical data is separate from camera images and video, which are processed on your device and are not uploaded by the scanner. Google states that ML Kit encrypts this data in transit using HTTPS and does not transfer it to third parties. Details: https://developers.google.com/ml-kit/android-data-disclosure .",
  },
  {
    title: 'Permissions',
    body: 'Camera permission is needed only to scan QR codes. Audio playback uses the device audio system. The app does not use the microphone to record you.',
  },
  {
    title: 'Retention and your choices',
    body: "The app does not maintain a user account or upload a personal profile. QR scans are processed for the requested action and are not stored by the app as a scan history. You can deny or revoke camera access in Android settings; scanning is optional. You can request information, correction, or deletion by contacting the publisher. Uninstalling the app removes its local app data, but does not delete data already held by service providers. Provider retention and deletion practices are governed by their published policies, including Google's privacy policy at https://policies.google.com/privacy . The publisher cannot promise deletion of independently controlled provider logs or SDK telemetry.",
  },
  {
    title: 'Changes',
    body: 'This policy may be updated if the app or its data practices change. The effective date below identifies the current version.',
  },
];

export default function PrivacyScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />
      <TopBar />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} accessibilityRole="header">Privacy Policy</Text>
        <Text style={[styles.date, { color: colors.text }]}>Effective 23 October 2026</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.heading, { color: colors.primary }]} accessibilityRole="header">{section.title}</Text>
            <Text style={[styles.body, { color: colors.text }]}>{section.body}</Text>
          </View>
        ))}
        <Pressable
          onPress={() => Linking.openURL('mailto:marcobester@gmail.com?subject=Blind%20Alphabet%20privacy%20request')}
          accessibilityRole="link"
          style={styles.contact}
        >
          <Text style={[styles.contactText, { color: colors.primary }]}>Email the privacy contact</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}>
          <Text style={[styles.backText, { color: colors.text }]}>Back</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 24, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: '900', marginTop: 16 },
  date: { fontSize: 14, marginTop: 8, marginBottom: 24 },
  section: { marginBottom: 22 },
  heading: { fontSize: 19, fontWeight: '900', marginBottom: 8 },
  body: { fontSize: 16, lineHeight: 24 },
  contact: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  contactText: { fontSize: 16, fontWeight: '800', textDecorationLine: 'underline' },
  back: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start', paddingVertical: 8 },
  backText: { fontSize: 16, fontWeight: '700' },
});