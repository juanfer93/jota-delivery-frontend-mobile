import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import tw from '@/lib/tailwind'; 

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tw.color('jj-blue'), 
        tabBarInactiveTintColor: tw.color('gray-400'),
        tabBarLabelStyle: tw`font-bold text-xs pb-1`,
        tabBarStyle: tw`bg-white border-t border-gray-200 h-16 pt-2`,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="delivery"
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="bicycle-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Mi Perfil',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}