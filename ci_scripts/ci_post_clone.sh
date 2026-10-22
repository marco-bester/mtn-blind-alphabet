#!/bin/sh
set -eu

cd "${CI_PRIMARY_REPOSITORY_PATH:?CI_PRIMARY_REPOSITORY_PATH is required}"
: "${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:?Set EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET in the Xcode Cloud workflow environment}"

npm ci
npx expo prebuild --platform ios --no-install
pod install --project-directory=ios

cp -R ios/BlindAlphabet.xcworkspace ios/mtnblindalphabet.xcworkspace
cp ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/BlindAlphabet.xcscheme \
	ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/mtnblindalphabet.xcscheme