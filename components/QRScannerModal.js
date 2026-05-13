import { CameraView } from 'expo-camera';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export default function QRScannerModal({ visible, scanned, onBarCodeScanned, onClose }) {
  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.scannerWrapper} accessible accessibilityLabel="Scanner view">
        <CameraView
          onBarcodeScanned={onBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barcodeScannerEnabled={!scanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
        <View style={styles.overlay}>
          <Text style={styles.scanText} allowFontScaling>
            Align the QR inside the frame
          </Text>
          <Pressable
            onPress={() => {
              onClose();
              AccessibilityInfo.announceForAccessibility('Scanner closed.');
            }}
            style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.85 : 1 }]}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Close scanner"
            accessibilityHint="Returns to the previous screen"
          >
            <Text style={styles.cancelText} allowFontScaling>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const MIN_TOUCH = 48;
const styles = StyleSheet.create({
  scannerWrapper: { flex: 1, backgroundColor: '#000' },
  overlay: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16
  },
  scanText: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 8 },
  cancelBtn: {
    backgroundColor: '#FFD700',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: MIN_TOUCH,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: { color: '#000', fontSize: 16, fontWeight: '700' }
});