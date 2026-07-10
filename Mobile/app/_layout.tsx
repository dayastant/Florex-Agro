import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        {/* Auth flow */}
        <Stack.Screen name="index"            options={{ headerShown: false }} />
        <Stack.Screen name="login"            options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password"  options={{ headerShown: false }} />

        {/* Main tabs */}
        <Stack.Screen name="(tabs)"           options={{ headerShown: false }} />

        {/* Farm drill-down */}
        <Stack.Screen name="farms/[id]/index"                    options={{ headerShown: false }} />
        <Stack.Screen name="farms/[id]/zones/index"              options={{ headerShown: false }} />
        <Stack.Screen name="farms/[id]/zones/create"             options={{ headerShown: false }} />
        <Stack.Screen name="farms/[id]/zones/[zoneId]/edit"      options={{ headerShown: false }} />
        <Stack.Screen name="farms/[id]/hardware/motors"          options={{ headerShown: false }} />
        <Stack.Screen name="farms/[id]/hardware/valves"          options={{ headerShown: false }} />

        {/* Feature screens */}
        <Stack.Screen name="irrigation/manual"    options={{ headerShown: false }} />
        <Stack.Screen name="irrigation/schedules" options={{ headerShown: false }} />
        <Stack.Screen name="weather"              options={{ headerShown: false }} />
        <Stack.Screen name="notifications"        options={{ headerShown: false }} />
        <Stack.Screen name="reports"              options={{ headerShown: false }} />
        <Stack.Screen name="profile"              options={{ headerShown: false }} />
        <Stack.Screen name="settings"             options={{ headerShown: false }} />
        <Stack.Screen name="help"                 options={{ headerShown: false }} />

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" backgroundColor="#080d10" />
    </ThemeProvider>
  );
}
