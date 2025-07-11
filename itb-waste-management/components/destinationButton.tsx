import { View, Text, Pressable, Linking, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type MapButtonProps = {
  latitude: number;
  longitude: number;
  label?: string;
};

export default function MapButton({
  latitude,
  longitude,
  label,
}: MapButtonProps) {
  const openGoogleMaps = async () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open Google Maps.");
    }
  };

  return (
    <View className="items-center mt-4">
      <Pressable
        onPress={openGoogleMaps}
        className="flex-row items-center bg-blue-500 px-4 py-3 rounded-xl"
      >
        <Ionicons name="location-outline" size={20} color="#fff" />
        <Text className="text-white ml-2 font-semibold">
          {label ?? "Open Location"}
        </Text>
      </Pressable>
    </View>
  );
}
