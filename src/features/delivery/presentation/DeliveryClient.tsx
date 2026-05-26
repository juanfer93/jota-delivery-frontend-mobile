import { useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView } from "react-native";
import { useRouter } from "expo-router"; 
import tw from '@/lib/tailwind';
import { useDeliveryStore } from "@/features/delivery/application/delivery.store";
import { Pedido, PedidoEstado } from "@/features/delivery/domain/delivery.types";

interface DeliveryClientProps {
  adminName: string;
}

export function DeliveryClient({ adminName }: DeliveryClientProps) {
  const router = useRouter(); 
  const { pedidosHoy, status, error, loadData, updateEstado } = useDeliveryStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const pedidosPorDomiciliario = useMemo(() => {
    const map = new Map<string, Pedido[]>();
    for (const p of pedidosHoy) {
      const key = p.usuarioId || "Sin domiciliario";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    return Array.from(map.entries());
  }, [pedidosHoy]);

  const renderEstadoBotones = (pedidoId: string, estadoActual: PedidoEstado) => {
    return (
      <View style={tw`flex-row flex-wrap gap-2 mt-2`}>
        {Object.values(PedidoEstado).map((estado) => (
          <TouchableOpacity
            key={estado}
            onPress={() => updateEstado(pedidoId, estado)}
            style={tw`px-3 py-1.5 rounded-lg border ${
              estadoActual === estado
                ? "bg-jj-blue border-jj-blue"
                : "bg-white border-jj-beige"
            }`}
          >
            <Text
              style={tw`text-xs font-bold ${
                estadoActual === estado ? "text-jj-beige" : "text-jj-blueDark"
              }`}
            >
              {estado}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-jj-beigeSoft`}>
      <ScrollView contentContainerStyle={tw`p-6 max-w-[800px] w-full self-center`}>
        
        {/* Header */}
        <View style={tw`mb-8`}>
          <Text style={tw`text-2xl font-bold text-jj-blueDark`}>
            Delivery
          </Text>
          <Text style={tw`text-sm text-jj-blueDark/60 uppercase tracking-widest`}>
            Bienvenido, {adminName}
          </Text>
        </View>

        {/* Acciones */}
        <View style={tw`flex-row gap-2 mb-6`}>
          <TouchableOpacity 
            onPress={() => router.push("/delivery/create")}
            style={tw`bg-jj-blue px-6 py-3 rounded-xl shadow-sm`}
          >
            <Text style={tw`text-white font-bold`}>Nuevo Pedido</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={tw`p-4 bg-red-50 border border-red-100 rounded-xl mb-6`}>
            <Text style={tw`text-red-600 font-semibold text-sm`}>Error: {error}</Text>
          </View>
        )}

        {/* Lista de Pedidos */}
        <View style={tw`gap-6`}>
          {status === "loading" ? (
             <ActivityIndicator size="large" color="#174A8B" />
          ) : pedidosHoy.length === 0 ? (
            <View style={tw`p-8 items-center bg-white rounded-3xl border border-jj-blueDark/5`}>
                <Text style={tw`text-jj-blueDark/60`}>No hay pedidos hoy.</Text>
            </View>
          ) : (
            pedidosPorDomiciliario.map(([domId, items]) => (
              <View key={domId} style={tw`rounded-3xl border border-jj-blueDark/10 bg-white p-5 shadow-sm`}>
                <Text style={tw`text-base font-bold text-jj-blueDark mb-4`}>{domId}</Text>
                
                {items.map((p) => (
                  <View key={p.id} style={tw`rounded-2xl border border-jj-beige bg-jj-beigeSoft p-4 mb-3`}>
                    <Text style={tw`font-bold text-jj-blue text-sm`}>
                      Comercio: {p.comercioId}
                    </Text>
                    <Text style={tw`text-sm text-jj-blueDark/80 mt-1`}>
                        Valor: {Number(p.valorFinal ?? 0).toLocaleString()}
                    </Text>
                    
                    <View style={tw`mt-3`}>
                      <Text style={tw`text-xs font-bold text-jj-blueDark/50 uppercase`}>Cambiar estado:</Text>
                      {renderEstadoBotones(p.id, p.estado)}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}