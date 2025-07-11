import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("driverToken");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#F7F8FC] justify-between">
      {/* Header */}
      <View className="bg-[#5A82FC] rounded-b-[40px] pb-10 items-center pt-16">
        <Text className="text-white text-lg font-bold">Waste Driver</Text>
        <View className="mt-6 w-24 h-24 rounded-full bg-white items-center justify-center shadow-md">
          <View className="w-12 h-12 rounded-full bg-[#5A82FC]" />
        </View>
      </View>

      {/* Logout Button */}
      <View className="bg-[#DCE6FF] rounded-t-[50px] px-6 pt-8 pb-16 items-center">
        <Pressable
          onPress={handleLogout}
          className="bg-white border border-[#5A82FC] px-12 py-3 rounded-full shadow-md"
        >
          <Text className="text-[#5A82FC] font-semibold text-base">Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}
