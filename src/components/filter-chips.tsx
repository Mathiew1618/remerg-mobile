import { Pressable, ScrollView, Text } from 'react-native';

export type FilterOption<K extends string> = { key: K; label: string };

/**
 * A horizontal row of toggle chips. Generic over the filter key so the
 * treatment-facility and halfway-house lists can each keep their own
 * vocabulary while looking and behaving identically.
 */
export function FilterChips<K extends string>({
  options,
  active,
  onToggle,
}: {
  options: FilterOption<K>[];
  active: K[];
  onToggle: (key: K) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 py-2 pr-4">
      {options.map((o) => {
        const on = active.includes(o.key);
        return (
          <Pressable
            key={o.key}
            onPress={() => onToggle(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            className={`min-h-[38px] justify-center rounded-full border px-3.5 active:opacity-70 ${
              on ? 'border-accent bg-accent' : 'border-line bg-elevated'
            }`}>
            <Text className={`text-[13px] font-bold ${on ? 'text-brand' : 'text-ink'}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
