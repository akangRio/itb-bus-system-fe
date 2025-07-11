import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
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
        },
        tabBarLabelStyle: { fontSize: 12 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "schedule") {
            return (
              <Ionicons name="calendar-outline" size={size} color={color} />
            );
          } else if (route.name === "profile") {
            return <Ionicons name="person-outline" size={size} color={color} />;
          }
        },
      })}
    >
      <Tabs.Screen name="schedule" options={{ title: "Schedule" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
