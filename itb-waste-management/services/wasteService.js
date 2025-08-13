// src/services/authService.js
import { api } from "../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_USERNAME = process.env.EXPO_PUBLIC_API_USERNAME;
const API_PASSWORD = process.env.EXPO_PUBLIC_API_PASSWORD;

export const loginWasteDriver = async (plate_number, password) => {
  try {
    const response = await api.post(
      "/auth/user",
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

export const getSchedule = async (date) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");
  try {
    const response = await api.get(`/driver/trip?date=${date}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to fetch schedule";
    throw new Error(msg);
  }
};

export const submitReport = async ({ id, match, collected, note, image }) => {
  const token = await AsyncStorage.getItem("driverToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/driver/trip",
      {
        id,
        match,
        collected,
        note,
        image,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.log(error.message);
    const msg = error.response?.data?.message || "Failed to submit report";
    console.log(msg);
    throw new Error(msg);
  }
};
