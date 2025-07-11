import React from "react";
import { View, Text, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  date: Date;
  onChangeDate: (newDate: Date) => void;
};

export default function DatePickerModal({ date, onChangeDate }: Props) {
  const [showPicker, setShowPicker] = React.useState(false);

  const onChange = (_: any, selectedDate: Date | undefined) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (selectedDate) onChangeDate(selectedDate);
  };

  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <View className="mt-4">
      <Pressable
        onPress={() => setShowPicker(true)}
        className="px-3 py-2 bg-[#f5f6fb] rounded-lg"
      >
        <Text className="text-gray-700 font-medium">{formattedDate}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChange}
        />
      )}
    </View>
  );
}
