import { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  Pressable,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { loginWasteDriver } from "../services/wasteService";
import "../global.css";

export default function LoginScreen() {
  const router = useRouter();

  const [plateNumber, setPlateNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if token exists
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("driverToken");
      if (token) {
        router.replace("/(tabs)/waste");
      }
    };
    checkToken();
  }, []);

  const handleLogin = async () => {
    if (!plateNumber.trim() || !password.trim()) {
      Alert.alert("Input Required", "Please enter plate number and password");
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginWasteDriver(plateNumber, password);

      await AsyncStorage.setItem("driverToken", data.token); // Save token
      await AsyncStorage.setItem("driverPlate", plateNumber);
      await AsyncStorage.setItem("map", data.map);
      await AsyncStorage.setItem("contact", data.contact);

      router.replace("/(tabs)/waste");
    } catch (err) {
      console.error("❌ Login failed:", err);
      Alert.alert("Login Failed", "Incorrect plate number or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Centered form */}
          <View className="flex-1 items-center justify-center px-7">
            <Image
              source={require("../assets/images/institut-teknologi-bandung.png")}
              style={{
                width: 120,
                height: 120,
                resizeMode: "contain",
                marginBottom: 20,
              }}
            />
            <Text className="text-3xl font-semibold mb-10">
              ITB Waste Management
            </Text>

            <TextInput
              placeholder="Nomor Plat"
              placeholderTextColor="#CBD5E0"
              value={plateNumber}
              onChangeText={setPlateNumber}
              className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-lg leading-6 text-gray-700"
              style={{
                shadowColor: "#5A82FC",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 5,
              }}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#CBD5E0"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              className="w-full bg-white rounded-xl px-4 py-3 shadow-sm text-lg text-gray-700 mt-4"
              style={{
                shadowColor: "#5A82FC",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 5,
              }}
            />
          </View>

          {/* Action button – sticks to bottom of ScrollView, but moves up with keyboard */}
          <Pressable
            onPress={handleLogin}
            className="mx-auto mb-12 w-[80%] max-w-md bg-[#5A82FC] rounded-full py-4 shadow-lg items-center justify-center"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Login</Text>
            )}
          </Pressable>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
