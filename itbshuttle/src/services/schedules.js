import { api } from "../lib/api";
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD;
const API_USERNAME = import.meta.env.VITE_API_USERNAME;

export const getSchedules = async (date, origin) => {
  console.log(date, origin);
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.get("/user/schedule", {
      params: { date, origin },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.log(error.config);
    const msg = error.response?.data?.message || "Failed to fetch schedules.";
    throw new Error(msg);
  }
};

export const getTickets = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.get("/user/ticket", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.log(error.config);
    const msg = error.response?.data?.message || "Failed to fetch tickets.";
    throw new Error(msg);
  }
};

export const getProfile = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.get("/user/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.log(error.config);
    const msg = error.response?.data?.message || "Failed to fetch profile.";
    throw new Error(msg);
  }
};

export const bookSchedule = async (id) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/user/schedule/book",
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.log(error.config);
    const msg = error.response?.data?.message || "Failed to book schedule.";
    throw new Error(msg);
  }
};

export const checkinQR = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No token found");

    const response = await api.get(`/user/ticket/check-in?id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to QR check-in .";
    throw new Error(msg);
  }
};

export const manualCheckIn = async (id, pin) => {
  const token = localStorage.getItem("accessToken");
  if (!token) throw new Error("No token found");

  try {
    const response = await api.post(
      "/user/ticket/check-in",
      { id, pin },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.data;
  } catch (error) {
    console.log(error?.config);
    const msg = error.response?.data?.message || "Failed to check-in ticket.";
    throw new Error(msg);
  }
};

export const cancelTicket = async (id) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No token found");

    const response = await api.post(
      `/user/ticket/cancel`,
      { id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data.data;
  } catch (error) {
    const msg = error.response?.data?.message || "Failed to Cancel Ticket .";
    throw new Error(msg);
  }
};
