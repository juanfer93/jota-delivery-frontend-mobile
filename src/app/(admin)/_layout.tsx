import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="domiciliarios/create" />
      <Stack.Screen name="comercios/create" />
      <Stack.Screen name="profile/index" />
    </Stack>
  );
}
