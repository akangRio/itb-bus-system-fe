import { api } from "../lib/api";
const API_PASSWORD = process.env.EXPO_PUBLIC_API_PASSWORD;
const API_USERNAME = process.env.EXPO_PUBLIC_API_USERNAME;
import AsyncStorage from "@react-native-async-storage/async-storage";

export const loginDriver = async (plate_number, password) => {
  try {
    const response = await api.post(
      "/auth/driver",
      {
        plate_number,
        password,
      },
      {
        auth: {
          username: API_USERNAME,
          password: API_PASSWORD,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.log(error.config);
    const msg =
      error.response?.data?.message || "Login failed. Please try again.";
    throw new Error(msg);
  }
};

export const getTrips = async (date) => {
  try {
    const token = await AsyncStorage.getItem("driverToken");

    const response = await api.get("/driver/trip/schedule", {
      params: { date }, // date in YYYY-MM-DD
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data; // Assuming the useful part is in `.data`
  } catch (error) {
    console.log(error);
    const msg =
      error.response?.data?.message ||
      "Failed to fetch trips. Please try again.";
    throw new Error(msg);
  }
};

export const getDriverProfile = async () => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.get("/driver/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to fetch profile";
    throw new Error(msg);
  }
};

export const showQR = async (tripId) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.get(`/driver/trip/qr?id=${tripId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to fetch QR";
    throw new Error(msg);
  }
};

export const startTrip = async (tripId, lat, long) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/driver/trip/start",
      {
        id: tripId,
        lat,
        long,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to start trip";
    throw new Error(msg);
  }
};

export const endTrip = async (tripId, lat, long) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/driver/trip/end",
      {
        id: tripId,
        lat,
        long,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to end trip";
    throw new Error(msg);
  }
};

export const sendLiveTracking = async (id, lat, long) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/driver/trip/live-tracking",
      { id, lat, long },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to send live tracking";
    throw new Error(msg);
  }
};
