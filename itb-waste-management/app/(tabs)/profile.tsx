import { View, Text, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function ProfileScreen() {
  const router = useRouter();
  const [waUrl, setWaUrl] = useState<any>("");
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("driverToken");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    AsyncStorage.getItem("contact").then((url): any => {
      setWaUrl(url);
    });
  }, [waUrl]);
  return (
    <View className="flex-1 bg-[#F7F8FC] justify-between">
      {/* Header */}
      <View>
        <View className="bg-[#5A82FC] rounded-b-[40px] pb-10 items-center pt-16">
          <Text className="text-white text-lg font-bold">Waste Driver</Text>
          <View className="mt-6 w-24 h-24 rounded-full bg-white items-center justify-center shadow-md">
            <View className="w-12 h-12 rounded-full bg-[#5A82FC]" />
          </View>
        </View>

        <View className="px-6 mt-6 space-y-4">
          <Text className="text-gray-400 text-sm">Detail Information</Text>
          <View className="border-b border-gray-300 pb-2">
            <Text className="text-base text-gray-800">
              {AsyncStorage.getItem("driverPlate")}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <View>
        <Pressable
          onPress={() => {
            Linking.openURL(waUrl);
          }}
          className="bg-[#2F4B87] py-4 items-center"
        >
          <Text className="text-white font-medium text-base">
            Contact Support
          </Text>
        </Pressable>
        <View className="bg-[#DCE6FF] rounded-t-[50px] px-6 pt-8 pb-16 items-center">
          <Pressable
            onPress={handleLogout}
            className="bg-white border border-[#5A82FC] px-12 py-3 rounded-full shadow-md"
          >
            <Text className="text-[#5A82FC] font-semibold text-base">
              Logout
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
