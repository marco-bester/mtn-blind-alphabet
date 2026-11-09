# MTN Blind Alphabet

MTN Blind Alphabet is an educational mobile app designed to help users learn and explore the Blind Alphabet, an art project by Willem Boshoff. The app provides audio descriptions and interactive content for each letter or concept in the Blind Alphabet, making the experience accessible to both sighted and visually impaired users.

# Technology and Project Structure

This document describes the stack and app organization used by MTN Blind Alphabet as a reference for building a similar cross-platform app.

## Technology Stack

- **Mobile and web UI:** React Native 0.88 with React 19.3.
- **Framework and native tooling:** Expo SDK 58, with Expo Router for file-based navigation and Expo modules for native capabilities.
- **Language:** JavaScript and TypeScript. TypeScript is enabled with strict settings, and Expo Router typed routes are enabled.
- **Navigation:** Expo Router, backed by React Navigation.
- **Camera and QR scanning:** `expo-camera`, configured to scan QR codes. Android uses the Google ML Kit barcode scanner through Expo Camera.
- **Audio playback:** `expo-audio` streams audio from remote URLs.
- **Other device features:** `expo-haptics` for vibration feedback; `expo-keep-awake` to keep the display on while the app is in use; `expo-image` for image handling; React Native safe-area and screen libraries for device layout.
- **Content storage:** Firebase Storage hosts a JSON song catalog and audio files. The app uses HTTP requests and Firebase Storage download URLs; it does not include the Firebase JavaScript SDK or a custom application server.
- **Quality and builds:** npm scripts, TypeScript, ESLint with `eslint-config-expo`, and Expo native projects for Android and iOS.

## How the App Is Organized

```text
app/                  Expo Router routes and layouts
  (tabs)/             Tab navigation routes
screens/              Screen UI and interaction logic
components/            Reusable UI, including the QR scanner modal
hooks/                 Shared stateful behavior, such as scanner controls
utils/                 QR payload parsing and catalog/storage access
assets/                App images and other bundled assets
plugins/               Expo config plugins for native build adjustments
android/, ios/         Native projects used for platform builds
```

The route files in `app/` stay small and render screens from `screens/`. Shared UI and device behavior live in `components/` and `hooks/`; parsing and remote data access live in `utils/`.

## Content and Playback Flow

1. The user scans a QR code with `expo-camera`.
2. `utils/parseQrPayload.js` accepts a plain title, a direct audio URL, or JSON containing a title and optional URL.
3. For a title, `utils/songCatalog.js` downloads `catalog.json` from Firebase Storage, finds the matching entry, and builds the audio download URL.
4. `screens/PlayerScreen.js` plays the audio with `expo-audio`, and uses haptics and accessibility announcements to report interactions and playback state.

The catalog is external to the app bundle, so adding or changing catalog entries and audio files does not require an app release. The Firebase Storage rules in this project allow public reads and deny writes; configure rules and media access to suit the needs of any new app.

The home screen's primary action is labeled **Scan**. The app keeps the device display awake while the app is in use.

## Run Locally

Requirements: Node.js/npm, and Xcode for iOS builds or Android Studio for Android builds.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set the Firebase Storage bucket. Copy `.env.example` to `.env` and set `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` to the bucket name for your Firebase project.

3. Start Expo:

   ```bash
   npm start
   ```

Useful platform commands:

```bash
npm run ios       # Build and run on an iOS simulator/device
npm run android   # Build and run on an Android emulator/device
npm run web       # Start the web version
npm run lint      # Run Expo ESLint checks
```

For a new project based on this structure, create an Expo app with Expo Router, then add only the Expo modules needed for the app's device features. Keep route definitions separate from screen logic, isolate data access and parsing in `utils/`, and keep environment-specific service configuration outside the source code.
