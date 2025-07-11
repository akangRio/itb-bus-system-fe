import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

export default function DatePickerModal({
  date,
  onChangeDate,
}: {
  date: Date;
  onChangeDate: (date: Date) => void;
}) {
  const [tempDate, setTempDate] = useState(date); // hold temporary selection
  const [showPicker, setShowPicker] = useState(false);

  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleConfirmIOS = () => {
    onChangeDate(tempDate); // commit selected date
    setShowPicker(false);
  };

  const handleCancelIOS = () => {
    setTempDate(date); // discard changes
    setShowPicker(false);
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      if (event.type === "set" && selectedDate) {
        onChangeDate(selectedDate); // commit directly
      }
      setShowPicker(false);
    } else {
      if (selectedDate) setTempDate(selectedDate); // update temporary value
    }
  };

  return (
    <View>
      {/* Tappable date display */}
      <Pressable onPress={() => setShowPicker(true)} className="py-1">
        <Text className="text-gray-500 text-base">{formattedDate}</Text>
      </Pressable>

      {/* Proper modal rendering logic */}
      {showPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={onChange}
        />
      )}

      {/* iOS modal handling (optional, for better UX) */}
      {Platform.OS === "ios" && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleCancelIOS}
        >
          <TouchableWithoutFeedback onPress={handleCancelIOS}>
            <View className="flex-1 justify-end bg-black/30">
              <View className="bg-white p-4 rounded-t-xl items-center">
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={onChange}
                />
                <Pressable
                  onPress={handleConfirmIOS}
                  className="mt-2 bg-blue-500 p-3 rounded-xl mb-10 w-full"
                >
                  <Text className="text-white text-center font-semibold">
                    Pilih Tanggal
                  </Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
}
