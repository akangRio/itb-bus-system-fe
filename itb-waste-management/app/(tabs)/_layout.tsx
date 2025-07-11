import { View } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <View className="flex-1 relative">
      {/* Background */}
      <View
        className="absolute -top-10 w-full h-[200px] bg-[#5A82FC] rounded-b-[200px] -z-10"
        pointerEvents="none"
      />
      <View
        className="absolute -bottom-10 w-full h-[200px] bg-[#5A82FC]/25 rounded-t-[200px] -z-10"
        pointerEvents="none"
      />

      <Tabs
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#5A82FC",
          tabBarInactiveTintColor: "#A0A0A0",
          tabBarStyle: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: 80,
            paddingBottom: 12,
            paddingTop: 8,
            backgroundColor: "#fff",
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ color, size }) => {
            if (route.name === "waste") {
              return (
                <Ionicons name="calendar-outline" size={size} color={color} />
              );
            } else if (route.name === "map") {
              return <Ionicons name="map-outline" size={size} color={color} />;
            } else if (route.name === "profile") {
              return (
                <Ionicons name="person-outline" size={size} color={color} />
              );
            }
          },
        })}
      >
        <Tabs.Screen name="waste" options={{ title: "Home" }} />
        <Tabs.Screen name="map" options={{ title: "Map" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </View>
  );
}
