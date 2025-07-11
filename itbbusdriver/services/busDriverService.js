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
        Cookie:
          ".Tunnels.Relay.WebForwarding.Cookies=CfDJ8Cs4yarcs6pKkdu0hlKHsZsPUsj_jVC4PJ7xB5Bk9kf1k0LutNDElP8ONbXW3sVX_lz-Si0mRcDDTf7FO7ts9edUBTJdXt00vNgdrkqtTE9pIPk_BlGwkOExxfg93VViphT-8KRSV98hYfIZYNCM6nHT4AMH_aBLrZDzKfQhGXxIsOTd0D4yvf5lpIrrx9uSSCko0TL-23tiL-67DYG8Q29pi2EEdv7xfRH_FBoLBwgKgF8CJQhGzJBBTiwFvtmZ00w-6keshuF17aN-S9ZtRuIl54hOn2w3kA2YDIqzZ3zS_D4iUCqgYbtcFXGqPC72x_IQ2ijEXjtpLToX9XU_5pta9k7H3-X03GffaENEigBGzjQIa4OjrwQ2PNTkXCzRL2bi9zx2PIHd5fDa_Wqs2abArPxY4zRbicSuu03P8aDLRsf4GdNRkW-UxkPTPYIokV7_1dnkP0fLJlXqAHFUZ9JrEhkn6tj5bVeiCaNJvPlzUp6mVc4VZV9JXgD8xVyFVGcxTzsW6T8z6ut6y_l77tUV2qky3xIJ0Hx_ZZ6WdIjgpGeKIEC5fHFKtjd7uhKp0-bDP8EWDIsQ8wiA6UtPfmvuif7JjlRLLu20xtL6Y6kR4ne_yZftIDY21gACqZI20Svehtqsgd-wa78szDgSNeuV4E8_2afGrJopZzsNJG6_EdMRiTy5q5Q7V-ZJoejv39kfmYoawoLH4w-dWyVtmlYDwkvhp0Ck2olxFa-xeLzjYVSLCNzVrgZ-UMFb1q3oM9IeJkF2cKA8wVRXF041JwHq-rW2wRc2-QHEayGhptYYsEtV6351tcQP0y2VJg3IMOO2ZQ9vs9GeKVYzeejw9t6ViyInwtvjocJvTboK_kw4vZDY3BJYaLFy7IEIjgR9fSrV2O9pZmqgSD9QvX_CgcXrdPrNzZSJuQ163lvo9Uwm",
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
