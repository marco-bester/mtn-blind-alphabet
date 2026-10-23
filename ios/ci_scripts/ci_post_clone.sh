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

if ! command -v npm >/dev/null 2>&1; then
  brew_bin="$(command -v brew || true)"
  if [ -z "$brew_bin" ]; then
    for candidate in /opt/homebrew/bin/brew /usr/local/bin/brew; do
      if [ -x "$candidate" ]; then
        brew_bin="$candidate"
        break
      fi
    done
  fi
  if [ -z "$brew_bin" ]; then
    echo 'Homebrew is required to install Node.js in Xcode Cloud.' >&2
    exit 1
  fi
  "$brew_bin" install node@22
  export PATH="$("$brew_bin" --prefix node@22)/bin:$PATH"
fi

npm ci
npx expo prebuild --platform ios --no-install
pod install --project-directory=ios

cp -R ios/BlindAlphabet.xcworkspace ios/mtnblindalphabet.xcworkspace
cp ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/BlindAlphabet.xcscheme \
  ios/BlindAlphabet.xcodeproj/xcshareddata/xcschemes/mtnblindalphabet.xcscheme