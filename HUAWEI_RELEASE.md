# Huawei AppGallery Update

The existing AppGallery app is `blind.alphabet`, version `1.0.0`, version code `9`. The next build is configured as version `1.0.1`, version code `10`.

## Required Before Release

- Obtain the original private signing key used for the released `blind.alphabet` APK, or confirm an AppGallery Connect signing-key migration that preserves the installed app's update identity. Do not substitute the Android debug key or create a new unrelated key.
- Publish `privacy-policy.html` on a stable HTTPS URL and enter that URL in AppGallery Connect. The app also exposes the matching policy at its Privacy Policy link.
- Test QR scanning and audio playback on a Huawei device and verify the Firebase Storage catalog and audio are reachable in the intended release regions.
- Confirm authorization for all MTN, University of Johannesburg, Blind Alphabet artwork, and audio content shown or played by the app.

## Local Signed APK

After confirming that the keystore is the correct update key, put these values in your user Gradle properties file (`~/.gradle/gradle.properties` on macOS). Never commit the keystore or passwords:

```properties
MYAPP_UPLOAD_STORE_FILE=/absolute/path/to/update-key.jks
MYAPP_UPLOAD_STORE_PASSWORD=...
MYAPP_UPLOAD_KEY_ALIAS=...
MYAPP_UPLOAD_KEY_PASSWORD=...
```

Build the APK from the repository root:

```sh
cd android
./gradlew :app:assembleRelease
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`. The release task intentionally fails when signing properties are missing. Upload the signed APK as a new version for the existing app in AppGallery Connect; do not create a new app entry. The generated `android/` directory is git-ignored, so the tracked Expo config plugin reapplies the signing guard during Android prebuild.