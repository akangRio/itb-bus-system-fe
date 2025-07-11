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
      router.replace("/(tabs)/waste");
    } catch (err) {
      console.error("❌ Login failed:", err);
      Alert.alert("Login Failed", "Incorrect plate number or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center justify-center bg-white">
        <View className="w-full max-w-md space-y-4 mb-10 px-7">
          <TextInput
            placeholder="Nomor Plat"
            placeholderTextColor="#CBD5E0"
            value={plateNumber}
            onChangeText={setPlateNumber}
            className="bg-white rounded-xl px-4 py-3 shadow-sm text-lg text-gray-700 mb-4"
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
            className="bg-white rounded-xl px-4 py-3 shadow-sm text-lg text-gray-700"
            style={{
              shadowColor: "#5A82FC",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 6,
              elevation: 5,
            }}
          />
        </View>

        <Pressable
          onPress={handleLogin}
          className="absolute bottom-40 w-[80%] max-w-md bg-[#5A82FC] rounded-full py-4 shadow-lg items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-base font-semibold">Login</Text>
          )}
        </Pressable>
      </View>
    </TouchableWithoutFeedback>
  );
}
