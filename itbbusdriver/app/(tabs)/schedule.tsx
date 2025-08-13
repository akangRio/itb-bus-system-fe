import {
  ScrollView,
  Text,
  View,
  ActivityIndicator,
  Modal,
  Image,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  endTrip,
  getTrips,
  showQR,
  startTrip,
  sendLiveTracking,
} from "@/services/busDriverService";
import dayjs from "dayjs";
import CardTrip from "@/components/cardTrip";
import DatePickerModal from "@/components/datePickerComponent";
import { Feather } from "@expo/vector-icons";
import "dayjs/locale/id";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";

export default function ScheduleScreen() {
  dayjs.locale("id");
  const router = useRouter();

  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plateNumber, setPlateNumber] = useState("");
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [startedTrips, setStartedTrips] = useState<string[]>([]);
  const [qrData, setQrData] = useState<{ qr_code: string; pin: string } | null>(
    null,
  );
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [startModalVisible, setStartModalVisible] = useState(false);
  const liveLocationInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("driverToken");
      const plate = await AsyncStorage.getItem("driverPlate");
      if (!token) {
        router.replace("/");
      } else {
        setPlateNumber(plate || "");
      }
    };
    checkAuth();
  }, []);

  const fetchTrips = async () => {
    const token = await AsyncStorage.getItem("driverToken");
    if (!token) return;

    setLoading(true);
    try {
      const date = dayjs(selectedDate).format("YYYY-MM-DD");
      const trips = await getTrips(date);
      setTrips(trips || []);
      setError("");
    } catch (err: any) {
      console.error("Error fetching trips:", err);
      setError(err.message || "Failed to load trips.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrips();
    }, [selectedDate]),
  );

  const handleShowQR = async (tripId: string) => {
    try {
      const data = await showQR(tripId);
      const selected = trips.find((t) => t.id === tripId);
      setQrData(data);
      setSelectedTrip(selected);
      setQrModalVisible(true);
    } catch (error: any) {
      console.error("Failed to get QR:", error.message);
    }
  };

  const getCurrentLocation = async (): Promise<{
    lat: string;
    long: string;
  }> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Permission to access location was denied");
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      return {
        lat: coords.latitude.toString(),
        long: coords.longitude.toString(),
      };
    } catch (err) {
      console.error("Failed to get location:", err);
      throw err;
    }
  };

  const startLiveLocation = (tripId: string) => {
    if (liveLocationInterval.current) return; // Prevent double interval

    liveLocationInterval.current = setInterval(
      async () => {
        try {
          const { lat, long } = await getCurrentLocation();
          await sendLiveTracking(tripId, lat, long);
        } catch (err) {
          console.warn("Failed to send live location:", err);
        }
      },
      10 * 60 * 1000,
    ); // Every 10 minutes
  };

  const stopLiveLocation = () => {
    if (liveLocationInterval.current) {
      clearInterval(liveLocationInterval.current);
      liveLocationInterval.current = null;
    }
  };

  const handleStartTrip = async () => {
    try {
      if (trips.some((t) => t.status === "on going")) {
        alert("Tidak bisa memulai perjalanan baru saat ada perjalanan aktif.");
        return;
      }

      const { lat, long } = await getCurrentLocation();
      await startTrip(selectedTrip.id, lat, long);
      setStartedTrips((prev) => [...prev, selectedTrip.id]);
      setStartModalVisible(false);
      startLiveLocation(selectedTrip.id);
      fetchTrips();
    } catch (err) {
      console.error("Failed to start trip:", err);
      alert("Gagal memulai perjalanan. Coba lagi.");
    }
  };

  const handleEndTrip = async () => {
    if (!selectedTrip) return;

    try {
      const location = await getCurrentLocation();
      await endTrip(selectedTrip.id, location.lat, location.long);

      alert("Trip ended successfully");
      stopLiveLocation();
      fetchTrips();
      setQrModalVisible(false);
    } catch (err: any) {
      console.error("Failed to end trip:", err.message);
      alert(err.message || "Failed to end trip");
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-blue-500 rounded-b-[40px] p-6">
        <Text className="text-white text-xl font-bold text-center mt-10">
          Schedules
        </Text>
        <DatePickerModal date={selectedDate} onChangeDate={setSelectedDate} />

        <View className="mt-2 bg-white p-3 rounded-xl">
          <Text className="text-gray-400 text-sm">Plate Number</Text>
          <Text className="text-gray-700 font-semibold">
            {plateNumber || "Loading..."}
          </Text>
        </View>
      </View>

      {/* Trip List */}
      <ScrollView
        className="px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#5A82FC" />
        ) : error ? (
          <Text className="text-red-500 text-center">{error}</Text>
        ) : trips.length === 0 ? (
          <Text className="text-gray-500 text-center mt-4">
            No trips found.
          </Text>
        ) : (
          trips.map((trip) => (
            <CardTrip key={trip.id} trip={trip} onShowQR={handleShowQR} />
          ))
        )}
      </ScrollView>

      {/* QR Modal */}
      <Modal
        transparent
        visible={qrModalVisible}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-xl p-4 items-center">
            {qrData && (
              <>
                <Image
                  source={{ uri: qrData.qr_code }}
                  className="w-64 h-64 mb-4"
                />
                <Text className="text-2xl font-semibold tracking-widest">
                  {qrData.pin}
                </Text>

                {selectedTrip?.status === "incoming" && (
                  <Pressable
                    onPress={() => {
                      setQrModalVisible(false);
                      setStartModalVisible(true);
                    }}
                    className="mt-4 bg-blue-500 px-6 py-2 rounded-full my-4"
                  >
                    <Text className="text-white font-semibold text-lg">
                      Start Trip
                    </Text>
                  </Pressable>
                )}

                {selectedTrip?.status === "on going" && (
                  <Pressable
                    onPress={handleEndTrip}
                    className="mt-4 bg-orange-400 px-6 py-2 rounded-full my-4"
                  >
                    <Text className="text-white font-semibold text-lg">
                      End Trip
                    </Text>
                  </Pressable>
                )}
              </>
            )}
            <Pressable
              onPress={() => setQrModalVisible(false)}
              className="mt-2"
            >
              <Text className="text-blue-500 font-medium">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Start Trip Modal */}
      <Modal
        transparent
        visible={startModalVisible}
        animationType="fade"
        onRequestClose={() => setStartModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-[85%] items-center">
            {selectedTrip && (
              <>
                <Text className="text-[#5A82FC] font-semibold text-lg mb-1">
                  Mulai Perjalanan
                </Text>
                <Text className="text-center text-sm mb-4">
                  {dayjs(selectedDate).format("dddd, DD MMMM YYYY")}
                  {"\n"}
                  {selectedTrip.route}
                  {"\n"}
                  {selectedTrip.departure_time} - {selectedTrip.arrival_time}
                </Text>
                <View className="bg-blue-500 p-4 rounded-full my-4">
                  <Feather name="check" size={32} color="white" />
                </View>
                <Pressable
                  className="bg-blue-500 px-6 py-2 rounded-full mb-2"
                  onPress={() => handleStartTrip()}
                >
                  <Text className="text-white font-semibold text-lg">
                    Mulai
                  </Text>
                </Pressable>
                <Pressable onPress={() => setStartModalVisible(false)}>
                  <Text className="text-blue-500 font-medium">Cancel</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
