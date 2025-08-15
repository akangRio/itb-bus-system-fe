import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

type Trip = {
  id: string;
  route: string;
  departure_time: string;
  arrival_time: string;
  available_show_qr: string;
  checked_in: string;
  status: "incoming" | "on going" | "finished";
};

export default function CardTrip({
  trip,
  onShowQR,
}: {
  trip: Trip;
  onShowQR?: (tripId: string) => Promise<void> | void;
}) {
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!isAvailable || loading) return;
    try {
      setLoading(true);
      await onShowQR?.(trip.id);
    } catch (err) {
      console.error("Show QR failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const [hour, minute] = trip.available_show_qr.split(":").map(Number);
      const availableTime = dayjs().hour(hour).minute(minute);
      setIsAvailable(now.isAfter(availableTime) || now.isSame(availableTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [trip.available_show_qr]);

  const [origin, destination] = trip.route.split(" → ");

  const getStatusColor = () => {
    switch (trip.status) {
      case "on going":
        return "bg-orange-400";
      case "finished":
        return "bg-gray-400";
      default:
        return "bg-[#5A82FC]";
    }
  };

  const isButtonDisabled =
    trip.status === "finished" ||
    loading ||
    trip.status === "incoming" ||
    trip.status === "on going";

  return (
    <View className="bg-white mx-auto my-4 w-[95%] rounded-[20px] px-6 py-4 shadow-md">
      {/* Top: Route and Status */}
      <View className="flex-row justify-between items-start">
        <Text className="text-lg font-bold text-[#2F4B87]">
          {origin} → {destination}
        </Text>
        <Text className="text-xs text-[#5A82FC] font-medium">
          Status:{" "}
          {trip.status === "incoming"
            ? "Belum berjalan"
            : trip.status === "on going"
              ? "Sedang berjalan"
              : "Selesai"}
        </Text>
      </View>

      {/* Mid Section: Text left, Button right */}
      <View className="flex-row justify-between items-start mt-4">
        {/* Time Info */}
        <View className="space-y-1">
          <Text className="text-gray-400 font-medium text-sm">
            Departure Time:{" "}
            <Text className="text-gray-700">{trip.departure_time}</Text>
          </Text>
          <Text className="text-gray-400 font-medium text-sm">
            Arrival Time:{" "}
            <Text className="text-gray-700">{trip.arrival_time}</Text>
          </Text>
          <Text className="text-gray-400 font-medium text-sm">
            Checked in: <Text className="text-gray-700">{trip.checked_in}</Text>
          </Text>
        </View>

        {/* Button / Countdown */}
        <View className="items-end ml-4">
          {isAvailable ? (
            <Pressable
              onPress={handleBook}
              disabled={isButtonDisabled}
              className={`px-5 py-2 rounded-xl shadow ${
                loading ? "bg-blue-300" : getStatusColor()
              }`}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  {trip.status === "finished"
                    ? "Ended"
                    : trip.status === "incoming"
                      ? "Available"
                      : "On Going"}
                </Text>
              )}
            </Pressable>
          ) : (
            <View className="items-center">
              <Text className="text-blue-400 text-sm mb-1">
                Available starting
              </Text>
              <View className="border-2 border-[#5A82FC] px-4 py-1.5 rounded-xl">
                <Text className="text-[#5A82FC] font-semibold text-base">
                  {trip.available_show_qr}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
