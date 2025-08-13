// app/(tabs)/qr.tsx
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import dayjs from "dayjs";
import {
  getTrips,
  showQR,
  getGeofencing,
  sendLiveTracking,
  startTrip,
  endTrip,
} from "@/services/busDriverService";
import { Ionicons } from "@expo/vector-icons";

type Trip = {
  id: string;
  route: string;
  departure_time: string;
  arrival_time: string;
  available_seats: number;
  available_show_qr: string;
  checked_in: string;
  status: "incoming" | "on going" | "finished";
  origin: string;
  destination: string;
};

type Geofence = {
  type: string;
  center: { lat: number; long: number };
  radius: number;
};

export default function QrScreen() {
  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [qr, setQr] = useState<any>(null);
  const [status, setStatus] = useState<"WAITING" | "OTW">("WAITING");
  const [location, setLocation] = useState<any>(null);

  const [displayQR, setDisplayQR] = useState(false);

  const originGeofence = useRef<Geofence | null>(null);
  const destinationGeofence = useRef<Geofence | null>(null);
  const hasLeftOrigin = useRef(false);
  const hasArrivedDestination = useRef(false);

  const tripRef = useRef<Trip | null>(null);

  const liveLocationInterval = useRef<NodeJS.Timeout | null>(null);

  const isInsideGeofence = (
    lat: number,
    long: number,
    geofence: Geofence,
  ): boolean => {
    const dx = lat - geofence.center.lat;
    const dy = long - geofence.center.long;
    const distance = Math.sqrt(dx * dx + dy * dy) * 111000; // meters
    return distance <= geofence.radius;
  };

  const onLeaveOrigin = async () => {
    if (!tripRef.current) return;

    try {
      const { lat, long } = await getCurrentLocation();
      await startTrip(tripRef.current.id, lat, long);
      startLiveLocation(tripRef.current.id);
      hasArrivedDestination.current = false;

      await selectTripAndSetState();
    } catch (err) {
      console.error("Failed to start trip:", err);
    }
  };

  const onArriveDestination = async () => {
    console.log("🏁 Arrived at destination geofence!");
    const currentTrip = tripRef.current;
    if (!currentTrip) return;

    try {
      const location = await getCurrentLocation();
      await endTrip(currentTrip.id, location.lat, location.long);

      stopLiveLocation();
      hasLeftOrigin.current = false;
      hasArrivedDestination.current = false;
      await selectTripAndSetState(); // fetch the next trip after ending

      alert("Trip ended successfully");
    } catch (err) {
      console.error("Failed to end trip:", err);
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

  const selectTripAndSetState = async () => {
    const today = dayjs().format("YYYY-MM-DD");
    const trips: Trip[] = await getTrips(today);
    const now = dayjs();

    // Only consider trips that are on going or incoming
    const validTrips = trips.filter(
      (t) => t.status === "on going" || t.status === "incoming",
    );

    // Sort by departure time
    const sortedTrips = [...validTrips].sort((a, b) => {
      const depA = dayjs(`${today} ${a.departure_time}`);
      const depB = dayjs(`${today} ${b.departure_time}`);
      return depA.diff(depB);
    });

    let selectedTrip: Trip | null = null;

    // 1️⃣ Trip exactly matching current time
    selectedTrip =
      sortedTrips.find((t) =>
        now.isSame(dayjs(`${today} ${t.departure_time}`), "minute"),
      ) || null;

    // 2️⃣ If none, next trip after now
    if (!selectedTrip) {
      selectedTrip =
        sortedTrips.find((t) =>
          dayjs(`${today} ${t.departure_time}`).isAfter(now),
        ) || null;
    }

    // 3️⃣ If none, earliest trip of the day
    if (!selectedTrip && sortedTrips.length > 0) {
      selectedTrip = sortedTrips[0];
    }

    // 4️⃣ If still none, just null
    if (!selectedTrip) {
      setTrip(null);
      setQr(null);
      setStatus("WAITING");
      originGeofence.current = null;
      destinationGeofence.current = null;
      return null;
    }

    // ✅ If found, update state
    setTrip(selectedTrip);
    setStatus(selectedTrip.status === "on going" ? "OTW" : "WAITING");
    setQr(await showQR(selectedTrip.id));

    // Map geofence locations
    const locationCodeMap: Record<string, string> = {
      Bandung: "BDG",
      Jatinangor: "JTNG",
    };

    const [originName, destinationName] = selectedTrip.route
      ?.split(" → ")
      .map((s) => s.trim()) || ["", ""];

    const originCode = locationCodeMap[originName] || "";
    const destinationCode = locationCodeMap[destinationName] || "";

    originGeofence.current = await getGeofencing(originCode);
    destinationGeofence.current = await getGeofencing(destinationCode);

    return selectedTrip;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await selectTripAndSetState();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    tripRef.current = trip;
  }, [trip]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 5 },
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setLocation({ latitude, longitude });

          // Check geofences if we have them
          if (originGeofence.current && !hasLeftOrigin.current) {
            const insideOrigin = isInsideGeofence(
              latitude,
              longitude,
              originGeofence.current,
            );
            if (!insideOrigin) {
              hasLeftOrigin.current = true;
              onLeaveOrigin();
            }
          }

          if (
            destinationGeofence.current &&
            hasLeftOrigin.current &&
            !hasArrivedDestination.current
          ) {
            const insideDest = isInsideGeofence(
              latitude,
              longitude,
              destinationGeofence.current,
            );
            if (insideDest) {
              hasArrivedDestination.current = true;
              onArriveDestination();
            }
          }
        },
      );
    })();
  }, []);

  const TopInfoCard = () => (
    <View className="bg-blue-500 rounded-b-[40px] p-6 w-full pt-16 absolute top-0">
      <Text className="text-white font-bold text-lg text-center mb-2">
        Check In
      </Text>
      <View className="flex-row">
        <Ionicons name="bus-outline" size={24} color="#FFF" />
        <Text className="text-white font-bold text-lg text-start mb-2 ml-2">
          {trip
            ? (() => {
                const [o, d] = trip.route?.split(" → ") || ["-", "-"];
                return `${o} → ${d}`;
              })()
            : "- → -"}
        </Text>
      </View>
      <View className="bg-white rounded-xl p-3">
        <Text>Departure Time: {trip?.departure_time || "-"}</Text>
        <Text>Arrival Time: {trip?.arrival_time || "-"}</Text>
        <Text>Available Seats: {trip?.checked_in ?? "-"}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#5A82FC" />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <TopInfoCard />
      {status === "WAITING" && trip && qr ? (
        <View className="items-center">
          <Image source={{ uri: qr.qr_code }} className="w-64 h-64 mb-4" />
          <Text className="text-2xl font-bold">{qr.pin}</Text>
        </View>
      ) : status === "OTW" ? (
        <View className="bg-gray-100 p-6 w-full items-center">
          <Ionicons name="bus-outline" size={64} color="#5A82FC" />
          <Text className="text-blue-500 text-lg my-4">
            Shuttle sedang dalam perjalanan...
          </Text>
          <TouchableOpacity
            onPress={() => setDisplayQR(!displayQR)}
            className="bg-orange-500 px-6 py-3 rounded-full mb-4"
          >
            <Text className="text-white font-bold">
              {displayQR ? "Sembunyikan Kode QR" : "Tampilkan Kode QR"}
            </Text>
          </TouchableOpacity>
          {displayQR && (
            <Image source={{ uri: qr.qr_code }} className="w-64 h-64 mb-4" />
          )}
        </View>
      ) : (
        <Text className="text-gray-500 mt-4">Tidak ada trip yang tersedia</Text>
      )}
      {location && (
        <Text className="mt-4 text-gray-500">
          📍 Lat: {location.latitude.toFixed(5)}, Long:{" "}
          {location.longitude.toFixed(5)}
        </Text>
      )}
    </View>
  );
}
