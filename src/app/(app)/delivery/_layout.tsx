import { Stack } from 'expo-router';

export default function DeliveryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="current-delivery" />
      <Stack.Screen name="create" options={{ presentation: 'modal' }} />
      <Stack.Screen name="history" />
    </Stack>
  );
}
