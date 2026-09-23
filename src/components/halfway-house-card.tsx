import { useState } from 'react';
import { Text, View } from 'react-native';

import { ActionButton } from '@/components/ui/action-button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { TRACK_LABELS, type CommCorrProgram } from '@/data/commcorr';
import { callNumber, openPlace } from '@/lib/dial';

/**
 * A community corrections program.
 *
 * Deliberately different from ResourceCard: the acceptance terms are the
 * point. Someone reading this is working out whether a referral here has any
 * chance, so "will they take a violent offence" sits one tap away on the card
 * rather than behind a navigation push.
 */
export function HalfwayHouseCard({ program: p }: { program: CommCorrProgram }) {
  const [open, setOpen] = useState(false);
  const where = [p.address, p.city, p.zip].filter(Boolean).join(', ');
  const hasDetail = p.tracks.length > 0 || Boolean(p.director);

  return (
    <View className="mb-3 rounded-card border border-line bg-surface p-3.5">
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft">
          <Icon name="mci:home-group" size={21} className="text-brand" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold leading-5 text-ink">{p.name}</Text>
          {p.subtitle ? (
            <Text numberOfLines={2} className="mt-0.5 text-xs text-muted">
              {p.subtitle}
            </Text>
          ) : null}
          {where ? <Text className="mt-1 text-[13px] leading-5 text-muted">{where}</Text> : null}
        </View>
      </View>

      <View className="mt-2.5 flex-row flex-wrap gap-1">
        {p.populationServed ? (
          <Badge text={p.populationServed} tone="accent" icon="mci:account-group" />
        ) : null}
        {p.tracks.map((t) => (
          <Badge key={t.track} text={TRACK_LABELS[t.track]?.short ?? t.track} />
        ))}
      </View>

      <View className="mt-3.5 flex-row flex-wrap gap-2">
        {p.phone ? (
          <ActionButton icon="mci:phone-in-talk" label="Call" primary onPress={() => callNumber(p.phone!, p.name)} />
        ) : null}
        {where ? (
          <ActionButton
            icon="mci:navigation-variant"
            label="Directions"
            onPress={() => openPlace({ name: p.name, address: where, lat: p.lat, lng: p.lng, phone: p.phone })}
          />
        ) : null}
        {hasDetail ? (
          <ActionButton
            icon={open ? 'ion:chevron-up' : 'ion:chevron-down'}
            label={open ? 'Hide terms' : 'Who they take'}
            onPress={() => setOpen((v) => !v)}
          />
        ) : null}
      </View>

      {open ? (
        <View className="mt-3.5 border-t border-line pt-3.5">
          {p.director ? <Row label="Director" value={p.director} /> : null}
          {p.tracks.map((t) => (
            <View key={t.track} className="mb-3.5">
              <Text className="mb-1 text-[13px] font-extrabold text-ink">
                {TRACK_LABELS[t.track]?.long ?? t.track}
              </Text>
              {t.length ? <Row label="Length" value={t.length} /> : null}
              {t.substanceAbuse ? <Row label="Substance use" value={t.substanceAbuse} /> : null}
              {t.mentalHealth ? <Row label="Mental health" value={t.mentalHealth} /> : null}
              {t.medical ? <Row label="Medical" value={t.medical} /> : null}
              {t.sexOffenders ? <Row label="Sex offences" value={t.sexOffenders} /> : null}
              {t.violentOffenders ? <Row label="Violent offences" value={t.violentOffenders} /> : null}
              {t.notes ? <Row label="Notes" value={t.notes} /> : null}
            </View>
          ))}
          <Text className="text-[11px] italic leading-4 text-muted">
            Placement is decided by the community corrections board, not by the program alone.
            These terms are what DCJ publishes — confirm with your case manager.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="mb-1 flex-row gap-2">
      <Text className="w-28 text-xs text-muted">{label}</Text>
      <Text className="flex-1 text-xs leading-4 text-ink">{value}</Text>
    </View>
  );
}
