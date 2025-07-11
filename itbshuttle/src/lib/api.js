import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
console.log("✅ API_URL:", API_URL); // Optional: remove this in production

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
