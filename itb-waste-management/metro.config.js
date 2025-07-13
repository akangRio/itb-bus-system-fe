// metro.config.js
// Learn more: https://docs.expo.dev/guides/customizing-metro/

const { getDefaultConfig } = require("expo/metro-config"); // ← keep Expo’s default
const { withNativeWind } = require("nativewind/metro"); // ← add Tailwind → RN

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Feed the default Expo config to NativeWind
module.exports = withNativeWind(config, { input: "./global.css" });
