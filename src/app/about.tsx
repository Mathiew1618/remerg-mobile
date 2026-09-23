import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
import { Band } from '@/components/ui/band';
import { Screen } from '@/components/ui/screen';
import { openUrl } from '@/lib/dial';
import { REMERG_ORIGIN } from '@/lib/remerg';

/** Copy lifted from remerg.com/about/ so the app tells the same story. */
const STATS = [
  { value: '31%', label: 'of people released from Colorado prisons are re-incarcerated within three years' },
  { value: '$150k', label: 'estimated cost of a single incidence of recidivism' },
];

export default function AboutScreen() {
  return (
    <Screen bands>
      <Band tone="green">
        <Text className="text-[28px] font-extrabold leading-9 tracking-tight text-brand">
          Ending recidivism in Colorado, one resource at a time.
        </Text>
        <Image
          source={require('../../assets/images/photos/helpline-call.jpg')}
          style={{ width: '100%', aspectRatio: 3 / 2, borderRadius: 20, marginTop: 16 }}
          contentFit="cover"
          accessibilityLabel="A woman on a phone call"
        />
        <Text className="mt-4 text-[15px] font-semibold leading-6 text-brand">
          Remerg is a 501(c)(3) founded to break down the barriers to re-entry and stop the revolving
          door of recidivism. By connecting people leaving prison and jail with housing, employment
          and community resources — when they need them — Remerg fosters agency and supports success.
        </Text>
      </Band>

      <Band tone="blue">
        <Text className="border-l-[3px] border-accent pl-3.5 text-[18px] font-bold italic leading-7 text-white">
          There are enough barriers to starting over. Navigating resources shouldn&apos;t have to be
          one of them.
        </Text>

        <View className="mt-5 gap-2.5">
          {STATS.map((s) => (
            <View key={s.value} className="rounded-card bg-surface p-4">
              <Text className="text-[34px] font-extrabold tracking-tight text-brand">{s.value}</Text>
              <Text className="mt-1 text-[13px] leading-5 text-muted">{s.label}</Text>
            </View>
          ))}
        </View>
      </Band>

      <Band tone="white">
        <LinkRow
          icon="mci:open-in-new"
          tone="text-brand"
          label="Read more at remerg.com"
          onPress={() => openUrl(`${REMERG_ORIGIN}/about/`)}
        />
        <LinkRow
          icon="mci:heart-outline"
          tone="text-crisis"
          label="Support Remerg"
          onPress={() => openUrl(`${REMERG_ORIGIN}/support/`)}
        />

        <Text className="mt-6 text-xs leading-5 text-muted">
          This app is an independent client built against Remerg&apos;s public website. It is not
          published or endorsed by Remerg. Hotline numbers were verified on 18 September 2026 —
          always dial 911 in an emergency.
        </Text>
      </Band>
    </Screen>
  );
}

function LinkRow({
  icon,
  tone,
  label,
  onPress,
}: {
  icon: IconName;
  tone: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      className="mb-3 min-h-touch flex-row items-center gap-2.5 rounded-card border-2 border-accent px-4 active:opacity-70">
      <Icon name={icon} size={18} className={tone} />
      <Text className="text-[15px] font-extrabold text-brand">{label}</Text>
    </Pressable>
  );
}
