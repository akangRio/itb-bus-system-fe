import { SafeAreaView } from "react-native";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <WebView
        source={{
          uri: "https://www.google.com/maps/d/viewer?mid=1LuWBEKfIPs9jPhHjnKkQ1b3p4MkuPnw&femb=1&ll=-6.914650268498564%2C107.57927865&z=10",
        }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
      />
    </SafeAreaView>
  );
}
