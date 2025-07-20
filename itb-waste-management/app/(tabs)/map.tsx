import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const [mapUrl, setMapUrl] = useState<any>("");
  useEffect(() => {
    AsyncStorage.getItem("map").then((url) => {
      setMapUrl(url);
    });
  }, [mapUrl]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <WebView
        source={{
          uri: mapUrl,
        }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}
