import { Text, View } from 'react-native';
import tw from '@/lib/tailwind';

interface PreviewItem {
  id: string;
  name: string;
  detail?: string;
}

interface EntityPreviewCardProps {
  title: string;
  emptyMessage: string;
  items: PreviewItem[];
}

export function EntityPreviewCard({ title, emptyMessage, items }: EntityPreviewCardProps) {
  const visibleItems = items.slice(0, 3);

  return (
    <View style={tw`mb-4 rounded-3xl border border-jjBeige bg-white p-5 shadow-sm`}>
      <View style={tw`mb-4 flex-row items-center justify-between`}>
        <Text style={tw`text-lg font-bold text-jjBlueDark`}>{title}</Text>
        <View style={tw`rounded-full bg-jjBeigeSoft px-3 py-1`}>
          <Text style={tw`text-xs font-bold text-jjBlueDark`}>{items.length}</Text>
        </View>
      </View>

      {visibleItems.length === 0 ? (
        <Text style={tw`text-sm text-jjBlueDark/60`}>{emptyMessage}</Text>
      ) : (
        visibleItems.map((item) => (
          <View key={item.id} style={tw`mb-3 flex-row items-center`}>
            <View style={tw`mr-3 h-9 w-9 items-center justify-center rounded-full bg-jjBlueDark`}>
              <Text style={tw`text-sm font-bold text-jjBeige`}>
                {item.name.trim().charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={tw`flex-1`}>
              <Text numberOfLines={1} style={tw`text-sm font-bold text-jjBlueDark`}>
                {item.name}
              </Text>
              {item.detail ? (
                <Text numberOfLines={1} style={tw`mt-0.5 text-xs text-jjBlueDark/60`}>
                  {item.detail}
                </Text>
              ) : null}
            </View>
          </View>
        ))
      )}

      {items.length > visibleItems.length ? (
        <Text style={tw`mt-1 text-xs font-semibold text-jjBlue`}>
          +{items.length - visibleItems.length} registrados
        </Text>
      ) : null}
    </View>
  );
}
