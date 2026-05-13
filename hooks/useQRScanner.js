import { useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { AccessibilityInfo, Alert } from 'react-native';

export function useQRScanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);

  const requestCamera = async () => {
    const { status } = await requestPermission();
    if (status !== 'granted') {
      Alert.alert('Camera permission needed', 'Please allow camera access to scan QR codes.');
    }
    return status === 'granted';
  };

  const openScanner = async () => {
    setScanned(false);
    let granted = permission?.granted ?? false;
    if (!granted) {
      granted = await requestCamera();
    }
    if (!granted) return;
    setScannerVisible(true);
    AccessibilityInfo.announceForAccessibility('Scanner opened. Point the camera at a QR code.');
  };

  const closeScanner = () => {
    setScannerVisible(false);
    // Allow slight delay before resetting scanned to prevent double triggers when closing
    setTimeout(() => setScanned(false), 400);
  };

  return {
    scannerVisible,
    scanned,
    setScanned,
    openScanner,
    closeScanner,
  };
}