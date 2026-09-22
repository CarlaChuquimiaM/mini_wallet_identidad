import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { SessionProvider } from "@/context/SessionContext";

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <SessionProvider>
      <ThemeProvider value={DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </SessionProvider>
  );
}
