// app/(tabs)/qr.tsx
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

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
  const waitingToEnterOrigin = useRef(false);
  const [qrAvailableTime, setQrAvailableTime] = useState<dayjs.Dayjs | null>(
    null,
  );
  const [qrCountdown, setQrCountdown] = useState<string | null>(null);

  const resetGeofenceFlags = () => {
    hasLeftOrigin.current = false;
    hasArrivedDestination.current = false;
    waitingToEnterOrigin.current = false;
  };

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

    // Only consider trips that are ongoing or upcoming
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

    // 1️⃣ Ongoing trip (now between departure and arrival)
    selectedTrip =
      sortedTrips.find(
        (t) =>
          now.isAfter(dayjs(`${today} ${t.departure_time}`)) &&
          now.isBefore(dayjs(`${today} ${t.arrival_time}`)),
      ) || null;

    // 2️⃣ If none, the next upcoming trip after now
    if (!selectedTrip) {
      selectedTrip =
        sortedTrips.find((t) =>
          dayjs(`${today} ${t.departure_time}`).isAfter(now),
        ) || null;
    }

    // 3️⃣ If none, just take the earliest trip of the day
    if (!selectedTrip && sortedTrips.length > 0) {
      selectedTrip = sortedTrips[0];
    }

    // 4️⃣ If still none, reset and exit
    if (!selectedTrip) {
      setTrip(null);
      setQr(null);
      setQrAvailableTime(null);
      setQrCountdown(null);
      setStatus("WAITING");
      originGeofence.current = null;
      destinationGeofence.current = null;
      resetGeofenceFlags();
      return null;
    }

    // ✅ Found a trip, update state
    setTrip(selectedTrip);
    setStatus(selectedTrip.status === "on going" ? "OTW" : "WAITING");

    try {
      const qr = await showQR(selectedTrip.id);
      setQr(qr);
      setQrAvailableTime(null);
      setQrCountdown(null);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || "";
      if (errorMsg.includes("Showing QR time has not been exceeded")) {
        const availableAt = dayjs(`${today} ${selectedTrip.departure_time}`);
        setQrAvailableTime(availableAt);
        setQr(null);
      } else {
        console.error("❌ QR fetch failed:", err);
        setQr(null);
        setQrAvailableTime(null);
        setQrCountdown(null);
      }
    }

    // Geofence handling
    if (selectedTrip.status === "on going") {
      hasLeftOrigin.current = true;
      hasArrivedDestination.current = false;
    } else {
      resetGeofenceFlags();
    }

    const locationCodeMap: Record<string, string> = {
      Bandung: "BDG",
      Jatinangor: "JTNG",
    };
    const [originName, destinationName] = selectedTrip.route
      ?.split(" → ")
      .map((s) => s.trim()) || ["", ""];
    originGeofence.current = await getGeofencing(
      locationCodeMap[originName] || "",
    );
    destinationGeofence.current = await getGeofencing(
      locationCodeMap[destinationName] || "",
    );

    const { lat, long } = await getCurrentLocation();
    if (
      originGeofence.current &&
      !isInsideGeofence(
        parseFloat(lat),
        parseFloat(long),
        originGeofence.current,
      )
    ) {
      waitingToEnterOrigin.current = true;
    } else {
      waitingToEnterOrigin.current = false;
    }

    return selectedTrip;
  };

  useEffect(() => {
    if (!qrAvailableTime) return;

    const interval = setInterval(() => {
      const diff = qrAvailableTime.diff(dayjs(), "second");
      if (diff <= 0) {
        clearInterval(interval);
        setQrCountdown(null);
        selectTripAndSetState(); // auto-refresh when time is up
        return;
      }

      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setQrCountdown(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [qrAvailableTime]);

  useFocusEffect(
    useCallback(() => {
      const run = async () => {
        await selectTripAndSetState();
      };
      run();
    }, []),
  );

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

          // 🟢 Handle Origin Geofence
          if (originGeofence.current) {
            const insideOrigin = isInsideGeofence(
              latitude,
              longitude,
              originGeofence.current,
            );

            if (waitingToEnterOrigin.current && insideOrigin) {
              waitingToEnterOrigin.current = false; // Now allowed to leave
            }

            if (
              !waitingToEnterOrigin.current &&
              !hasLeftOrigin.current &&
              !insideOrigin
            ) {
              hasLeftOrigin.current = true;
              onLeaveOrigin();
            }
          }

          // 🟢 Handle Destination Geofence
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
      <View className="bg-white rounded-xl p-3 flex-row items-center justify-between">
        <View>
          <Text>Departure Time: {trip?.departure_time || "-"}</Text>
          <Text>Arrival Time: {trip?.arrival_time || "-"}</Text>
          <Text>Available Seats: {trip?.checked_in ?? "-"}</Text>
        </View>

        <TouchableOpacity
          onPress={async () => {
            setLoading(true);
            try {
              await selectTripAndSetState();
            } catch (err) {
              console.error(err);
            } finally {
              setLoading(false);
            }
          }}
          className="p-2 rounded-full bg-blue-400"
        >
          <Ionicons name="refresh-outline" size={24} color="#FFF" />
        </TouchableOpacity>
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

      {/* Countdown info when QR is not yet available */}
      {qrCountdown && (
        <Text className="text-orange-500 text-lg mb-4 font-bold">
          QR tersedia dalam {qrCountdown}
        </Text>
      )}

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
      ) : !trip ? (
        <Text className="text-gray-500 mt-4">Tidak ada trip yang tersedia</Text>
      ) : null}

      {/*{location && (
        <Text className="mt-4 text-gray-500">
          📍 Lat: {location.latitude.toFixed(5)}, Long:{" "}
          {location.longitude.toFixed(5)}
        </Text>
      )}*/}
    </View>
  );
}
