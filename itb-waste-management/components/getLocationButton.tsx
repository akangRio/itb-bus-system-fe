import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import * as Location from "expo-location";
import BookingDialog from "./bookingDialog";

export default function LocationButton() {
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
  }>(null);

  const [errorMsg, setErrorMsg] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const getLocation = async () => {
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log(status);
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      // Get current position
      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setModalVisible(true);
    } catch (err) {
      setErrorMsg("Failed to get location");
      console.error(err);
    }
  };

  return (
    <View className="flex-1 items-center justify-center px-4 bg-white">
      <BookingDialog
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <Pressable
        onPress={getLocation}
        className="absolute bottom-10 w-[80%] max-w-md bg-[#5A82FC] rounded-full py-4 shadow-lg items-center justify-center"
      >
        <Text className="text-white text-base font-semibold">Start Trip</Text>
      </Pressable>
    </View>
  );
}
