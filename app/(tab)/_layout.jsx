import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { colors } from '../../src/utils/color';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentColors = isDarkMode ? colors.dark : colors.light;
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Appointment: focused ? 'calendar' : 'calendar-outline',
            Report: focused ? 'stats-chart' : 'stats-chart-outline',
            DeletedHistory: focused ? 'trash' : 'trash-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
        tabBarActiveTintColor: currentColors.activeTabBackground,
        tabBarInactiveTintColor: 'gray', // Changed to 'gray'
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarStyle: {
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
          backgroundColor: currentColors.tabBackground,
        },
      })}
    >
      <Tabs.Screen
        name="Appointment"
        options={{
          title: "Appointment",
        }}
      />
      <Tabs.Screen
        name="Report"
        options={{
          title: "Report",
        }}
      />
      <Tabs.Screen
        name="DeletedHistory"
        options={{
          title: "Delete History",
        }}
      />
    </Tabs>
  );
}