import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useAuth = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("token").then((token) => {
      setAuthToken(token);
      setLoading(false);
    });
  }, []);

  const login = async (token: string) => {
    await AsyncStorage.setItem("token", token);
    setAuthToken(token);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setAuthToken(null);
  };

  return { authToken, login, logout, loading };
};
