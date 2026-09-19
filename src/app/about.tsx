import { Pressable, Text, View } from 'react-native';

import { Icon, type IconName } from '@/components/ui/icon';
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
    <Screen>
      <Text className="text-[26px] font-extrabold leading-8 tracking-tight text-ink">
        Ending recidivism in Colorado, one resource at a time.
      </Text>

      <Text className="mt-3.5 text-[15px] leading-6 text-muted">
        Remerg is a 501(c)(3) founded to break down the barriers to re-entry and stop the revolving
        door of recidivism. By connecting people leaving prison and jail with housing, employment
        and community resources — when they need them — Remerg fosters agency and supports success.
      </Text>

      <Text className="mt-6 border-l-[3px] border-accent pl-3.5 text-[17px] font-semibold italic leading-6 text-ink">
        There are enough barriers to starting over. Navigating resources shouldn&apos;t have to be
        one of them.
      </Text>

      <View className="mt-6 gap-2.5">
        {STATS.map((s) => (
          <View key={s.value} className="rounded-card bg-elevated p-4">
            <Text className="text-[32px] font-extrabold tracking-tight text-brand">{s.value}</Text>
            <Text className="mt-1 text-[13px] leading-5 text-muted">{s.label}</Text>
          </View>
        ))}
      </View>

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

      <View className="mt-8 border-t border-line pt-3.5">
        <Text className="text-xs leading-5 text-muted">
          This app is an independent client built against Remerg&apos;s public website. It is not
          published or endorsed by Remerg. Hotline numbers were verified on 18 September 2026 —
          always dial 911 in an emergency.
        </Text>
      </View>
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
      className="mt-3 min-h-touch flex-row items-center gap-2.5 rounded-field border border-line px-3.5 active:opacity-70">
      <Icon name={icon} size={18} className={tone} />
      <Text className="text-[15px] font-bold text-ink">{label}</Text>
    </Pressable>
  );
}
