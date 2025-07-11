// components/BookingDialog.tsx
import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function BookingDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/30 backdrop-blur-sm">
        <View className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm">
          <Text className="text-xl font-semibold text-blue-600 mb-4 text-center">
            Booking Confirmation
          </Text>

          <View className="text-sm text-gray-600 mb-2 text-center">
            <Text className="text-black font-bold">Bandung ➔ Jatinangor</Text>
            <Text className="mt-1">Sabtu, 22 Januari 2025</Text>
            <Text className="text-gray-500">11.30 - 14.30</Text>
            <Text className="text-blue-600 mt-1 underline">3 seats left</Text>
          </View>

          <View className="my-4 items-center">
            <View className="bg-blue-500 p-4 rounded-full">
              <Feather name="check" size={32} color="white" />
            </View>
          </View>

          <View className="flex flex-col gap-2 mt-4">
            <Pressable
              onPress={() => alert("Booked!")}
              className="bg-blue-500 py-3 rounded-full items-center mb-2"
            >
              <Text className="text-white font-semibold">Book</Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              className="border border-blue-500 py-3 rounded-full items-center"
            >
              <Text className="text-blue-500 font-semibold">Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
