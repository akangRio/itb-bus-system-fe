import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#5A82FC",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
          position: "absolute",
        },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      {/* Trip Tab */}
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Trip",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />

      {/* QR Tab */}
      <Tabs.Screen
        name="qr"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <View
              style={{
                backgroundColor: "#5A82FC",
                width: 70,
                height: 70,
                borderRadius: 35,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 30,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
                elevation: 5,
              }}
            >
              <Ionicons name="qr-code-outline" size={32} color="#fff" />
            </View>
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
