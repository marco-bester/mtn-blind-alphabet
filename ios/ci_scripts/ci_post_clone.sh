#!/bin/sh
set -eu

if [ "${CI_POST_CLONE_REEXECUTED:-}" != "1" ]; then
  script_copy="$(mktemp "${TMPDIR:-/tmp}/ci_post_clone.XXXXXX")"
  cp "$0" "$script_copy"
  CI_POST_CLONE_REEXECUTED=1 CI_POST_CLONE_TEMP_SCRIPT="$script_copy" exec /bin/sh "$script_copy"
fi

if [ -n "${CI_POST_CLONE_TEMP_SCRIPT:-}" ]; then
  trap 'rm -f "$CI_POST_CLONE_TEMP_SCRIPT"' EXIT
fi

cd "${CI_PRIMARY_REPOSITORY_PATH:?CI_PRIMARY_REPOSITORY_PATH is required}"
: "${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:?Set EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET in the Xcode Cloud workflow environment}"

npm ci
npx expo prebuild --platform ios --no-install
pod install --project-directory=ios

cp -R ios/BlindAlphabet.xcworkspace ios/mtnblindalphabet.xcworkspace
cp ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/BlindAlphabet.xcscheme \
  ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/mtnblindalphabet.xcscheme