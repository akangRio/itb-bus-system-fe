import React, { useEffect, useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import * as Location from "expo-location";

export default function LocationTracker() {
  const [location, setLocation] = useState<null | {
    latitude: number;
    longitude: number;
  }>(null);
  const [tracking, setTracking] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const startTracking = () => {
    if (intervalRef.current || countdownRef.current) return;

    setTracking(true);
    getLocation(); // Get immediately

    // Set location interval
    intervalRef.current = setInterval(() => {
      getLocation();
      setCountdown(10);
    }, 10000);

    // Set countdown timer
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev === 1 ? 10 : prev - 1));
    }, 1000);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    setTracking(false);
    setCountdown(10);
  };

  useEffect(() => {
    return () => {
      // Clean up
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white px-4">
      {/* Buttons */}
      <Pressable
        onPress={startTracking}
        className="bg-green-500 rounded-full px-6 py-3 shadow-md mb-4"
        disabled={tracking}
      >
        <Text className="text-white font-semibold text-base">
          Start Tracking
        </Text>
      </Pressable>

      <Pressable
        onPress={stopTracking}
        className="bg-red-500 rounded-full px-6 py-3 shadow-md"
        disabled={!tracking}
      >
        <Text className="text-white font-semibold text-base">
          Stop Tracking
        </Text>
      </Pressable>

      {/* Countdown */}
      {tracking && (
        <Text className="mt-4 text-gray-600">
          Next location update in:{" "}
          <Text className="font-bold">{countdown}</Text>s
        </Text>
      )}

      {/* Location display */}
      <View className="mt-6 items-center">
        {location ? (
          <>
            <Text className="text-gray-700">Latitude: {location.latitude}</Text>
            <Text className="text-gray-700">
              Longitude: {location.longitude}
            </Text>
          </>
        ) : (
          <Text className="text-gray-400">Location not available</Text>
        )}
      </View>
    </View>
  );
}
