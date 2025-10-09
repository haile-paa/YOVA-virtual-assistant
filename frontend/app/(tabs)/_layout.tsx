import { Tabs } from "expo-router";
import { Grid3x3, Hop as Home, MessageCircle } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#2D2520",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: "#F5C563",
        tabBarInactiveTintColor: "#8B7965",
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name='assistant'
        options={{
          title: "YOVA",
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name='more'
        options={{
          title: "More",
          tabBarIcon: ({ size, color }) => (
            <Grid3x3 size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
