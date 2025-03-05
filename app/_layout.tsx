import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme } from 'react-native';
import { ReactNode } from 'react';
import { colors } from '../src/utils/color';
function CustomLayout({ children }: { children: ReactNode }) {

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const currentColors = isDarkMode ? colors.dark : colors.light;
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar  backgroundColor={currentColors.statusbarColor} style='light' />
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <CustomLayout>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="Login" />
        <Stack.Screen name="SignUp" />
        <Stack.Screen name="(tab)" /> {/* Tabs (Main App) */}
      </Stack>
    </CustomLayout>
  );
}
