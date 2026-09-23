import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import type { MemberOrg } from '@/data/members';
import { callNumber, openPlace, openUrl } from '@/lib/dial';

/**
 * One organisation from Remerg's listings: its logo, where it serves, what it
 * does in Remerg's own words, and one tap to call, visit or get there.
 * Descriptions run long, so they open three lines at a time.
 */
export function MemberCard({ org: o }: { org: MemberOrg }) {
  const [open, setOpen] = useState(false);
  const where = [o.city, o.regions.join(' · ')].filter(Boolean).join(' — ');

  return (
    <View className="mb-3 rounded-card bg-surface p-4">
      <View className="flex-row items-start gap-3">
        {o.logo ? (
          <Image
            source={{ uri: o.logo }}
            style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#F3F5F8' }}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        ) : null}
        <View className="flex-1">
          <Text className="text-[16px] font-extrabold leading-5 text-brand">{o.name}</Text>
          {where ? <Text className="mt-0.5 text-[13px] font-semibold text-muted">{where}</Text> : null}
        </View>
      </View>

      {o.description ? (
        <Pressable onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityLabel={open ? 'Show less' : 'Read more'}>
          <Text numberOfLines={open ? undefined : 3} className="mt-2.5 text-[14px] leading-5 text-ink">
            {o.description}
          </Text>
          <Text className="mt-1 text-xs font-bold text-accent-ink">{open ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}

      {o.hours ? <Text className="mt-2 text-[13px] text-muted">Hours: {o.hours}</Text> : null}

      {o.tags.length > 0 ? (
        <View className="mt-2.5 flex-row flex-wrap gap-1">
          {o.tags.map((t) => (
            <Badge key={t} text={t} />
          ))}
        </View>
      ) : null}

      <View className="mt-3.5 flex-row flex-wrap gap-2">
        {o.phone ? (
          <ActionButton icon="mci:phone-in-talk" label="Call" primary onPress={() => callNumber(o.phone!, o.name)} />
        ) : null}
        {o.website ? <ActionButton icon="mci:web" label="Website" onPress={() => openUrl(o.website!)} /> : null}
        {/* With coordinates this opens the in-app map (route + 3D); with only
            a city it falls back to the phone's maps app. */}
        {o.lat != null || o.address || o.city ? (
          <ActionButton
            icon="mci:navigation-variant"
            label="Directions"
            onPress={() =>
              openPlace({ name: o.name, address: o.address ?? `${o.city}, CO`, lat: o.lat, lng: o.lng, phone: o.phone, website: o.website })
            }
          />
        ) : null}
        <ActionButton icon="mci:open-in-new" label="Remerg" onPress={() => openUrl(o.url)} />
      </View>
    </View>
  );
}
