import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { KeyboardAvoidingView, Platform, View } from "react-native";

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View className="flex-1 relative">
          <Stack>
            <Stack.Screen
              name="index"
              options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </View>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
