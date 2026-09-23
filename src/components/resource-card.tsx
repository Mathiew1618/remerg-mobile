import { Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Icon, type IconName } from '@/components/ui/icon';
import type { Resource } from '@/data/resources';
import { callNumber, openPlace, openUrl } from '@/lib/dial';

/** The sign the facility's own service uses: Rx, a brain, a hospital cross. */
function kindIcon(kinds: string[]): IconName {
  const sa = kinds.includes('sa');
  const mh = kinds.includes('mh');
  if (sa && mh) return 'mci:hospital-box';
  if (sa) return 'mci:prescription';
  if (mh) return 'mci:brain';
  return 'mci:hospital-building';
}

export function ResourceCard({ resource: r }: { resource: Resource }) {
  const where = [r.address, r.city, r.zip].filter(Boolean).join(', ');

  return (
    <View className="mb-3 rounded-card border border-line bg-surface p-3.5">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft">
          <Icon name={kindIcon(r.kinds)} size={21} className="text-brand" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold leading-5 text-ink">{r.name}</Text>
          {r.subtitle ? <Text className="mt-0.5 text-[13px] text-muted">{r.subtitle}</Text> : null}
          {where ? <Text className="mt-1 text-[13px] leading-5 text-muted">{where}</Text> : null}
        </View>
      </View>

      <View className="mt-2.5 flex-row flex-wrap gap-1">
        {/* Leads the badge row on purpose: for this audience it is the first
            question, not a footnote. */}
        {r.flags.justiceInvolved ? (
          <Badge text="Takes justice-involved clients" tone="accent" icon="mci:shield-check" />
        ) : null}
        {r.flags.medicaid ? <Badge text="Medicaid" /> : null}
        {r.flags.slidingScale ? <Badge text="Sliding scale" /> : null}
        {r.flags.freeOrNoPayment ? <Badge text="No payment" /> : null}
        {r.flags.spanish ? <Badge text="Español" /> : null}
        {r.flags.veterans ? <Badge text="Veterans" /> : null}
      </View>

      <View className="mt-3.5 flex-row flex-wrap gap-2">
        {r.phone ? (
          <ActionButton icon="mci:phone-in-talk" label="Call" primary onPress={() => callNumber(r.phone!, r.name)} />
        ) : null}
        {where ? (
          <ActionButton
            icon="mci:navigation-variant"
            label="Directions"
            onPress={() => openPlace({ name: r.name, address: where, lat: r.lat, lng: r.lng, phone: r.phone, website: r.website })}
          />
        ) : null}
        {r.website ? (
          <ActionButton icon="mci:web" label="Website" onPress={() => openUrl(r.website!)} />
        ) : null}
      </View>
    </View>
  );
}
