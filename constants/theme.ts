/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const mtnYellow = '#FFD100';
const mtnBlack = '#000000';
const mtnBlue = '#0057B8'; // Optional accent, not always in MTN branding

export const Colors = {
  light: {
    text: mtnBlack,
    background: mtnYellow,
    tint: mtnBlack,
    icon: mtnBlack,
    tabIconDefault: mtnBlack,
    tabIconSelected: mtnBlack,
    accent: mtnBlue,
    link: mtnBlue,
    border: mtnBlack,
  },
  dark: {
    text: mtnYellow,
    background: mtnBlack,
    tint: mtnYellow,
    icon: mtnYellow,
    tabIconDefault: mtnYellow,
    tabIconSelected: mtnYellow,
    accent: mtnBlue,
    link: mtnYellow,
    border: mtnYellow,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
