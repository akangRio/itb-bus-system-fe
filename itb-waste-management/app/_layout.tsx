import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      {/* <View className="absolute -top-10 w-full h-[200px] bg-[#5A82FC] rounded-b-[200px] -z-10" /> */}
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false, gestureEnabled: false }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ headerShown: false }} />
        <Stack.Screen name="photoPreview" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      {/* <View
        className="absolute -bottom-10 w-full h-[200px] bg-[#5A82FC]/25 rounded-t-[200px] -z-10"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -30 },
          shadowOpacity: 0.02,
          shadowRadius: 60,
          elevation: 5, // optional: Android
        }}
      /> */}
    </ThemeProvider>
  );
}
