import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type CardScheduleProps = {
  building: string;
  quota: string;
  collected: boolean;
  id: string;
};

export default function CardSchedule({
  building,
  quota,
  collected,
  id,
}: CardScheduleProps) {
  const router = useRouter();

  const handleCamera = () => {
    console.log("Navigating to camera for:", id);
    router.push({
      pathname: "/camera",
      params: { id }, // pass the report_item id
    });
  };

  return (
    <View className="flex-row items-center justify-between bg-white rounded-2xl shadow-md px-4 py-4 mx-auto my-2 w-[92%]">
      {/* Left: Icon + Info */}
      <View className="flex-row items-start space-x-4">
        {/* Icon box */}
        <View className="bg-blue-100 rounded-xl p-4">
          <Ionicons name="business-outline" size={24} color="#3B82F6" />
        </View>

        {/* Text info */}
        <View className="ml-4">
          <Text className="text-base font-semibold text-gray-700">
            {building}
          </Text>
          <Text className="text-sm text-gray-500">Kuota : {quota} kg</Text>
          <Text className="text-sm text-gray-500">
            Status:{" "}
            <Text
              className={`font-medium ${
                collected ? "text-green-500" : "text-blue-500"
              }`}
            >
              {collected ? "Sudah Diambil" : "Belum Ambil"}
            </Text>
          </Text>
        </View>
      </View>

      {/* Camera Button */}
      {!collected && (
        <Pressable
          onPress={handleCamera}
          className="bg-blue-100 p-3 rounded-xl"
        >
          <Ionicons name="camera-outline" size={24} color="#3B82F6" />
        </Pressable>
      )}
    </View>
  );
}
