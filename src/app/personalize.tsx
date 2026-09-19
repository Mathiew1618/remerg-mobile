import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { AGE_RANGES, JUSTICE_STATUS, NEEDS } from '@/data/taxonomy';
import { useTheme } from '@/hooks/use-theme';
import { useProfile } from '@/lib/profile-context';

/**
 * The website's registration survey, rebuilt as an optional, skippable,
 * device-local step. See the note at the top of src/lib/profile.ts for why this
 * is deliberately not a signup wall.
 */
export default function PersonalizeScreen() {
  const colors = useTheme();
  const { profile, update, toggleNeed } = useProfile();

  return (
    <Screen>
      <View style={[styles.privacy, { backgroundColor: colors.accentSurface, borderColor: colors.accent }]}>
        <Ionicons name="lock-closed" size={18} color={colors.accent} />
        <Text style={[styles.privacyText, { color: colors.text }]}>
          Everything here stays on this phone. It is never uploaded, and you can skip all of it.
        </Text>
      </View>

      <Text style={[styles.h2, { color: colors.text }]}>What do you need help with?</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>Pick as many as apply.</Text>
      <View style={styles.wrap}>
        {NEEDS.map((n) => {
          const on = profile.needs.includes(n.id);
          return (
            <Pressable
              key={n.id}
              onPress={() => toggleNeed(n.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              accessibilityLabel={n.label}
              style={[
                styles.chip,
                { backgroundColor: on ? colors.tint : colors.backgroundElement, borderColor: on ? colors.tint : colors.border },
              ]}>
              {on ? <Ionicons name="checkmark" size={15} color={colors.onTint} /> : null}
              <Text style={[styles.chipText, { color: on ? colors.onTint : colors.text }]}>{n.short}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.h2, { color: colors.text }]}>Where are you in the process?</Text>
      <View style={styles.list}>
        {JUSTICE_STATUS.map((s) => {
          const on = profile.justiceStatus === s;
          return (
            <Pressable
              key={s}
              onPress={() => update({ justiceStatus: on ? null : s })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.option, { borderColor: on ? colors.tint : colors.border, backgroundColor: on ? colors.accentSurface : 'transparent' }]}>
              <Ionicons
                name={on ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={on ? colors.tint : colors.textSecondary}
              />
              <Text style={[styles.optionText, { color: colors.text }]}>{s}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.h2, { color: colors.text }]}>Age range</Text>
      <View style={styles.wrap}>
        {AGE_RANGES.map((a) => {
          const on = profile.ageRange === a;
          return (
            <Pressable
              key={a}
              onPress={() => update({ ageRange: on ? null : a })}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              style={[styles.chip, { backgroundColor: on ? colors.tint : colors.backgroundElement, borderColor: on ? colors.tint : colors.border }]}>
              <Text style={[styles.chipText, { color: on ? colors.onTint : colors.text }]}>{a}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.h2, { color: colors.text }]}>ZIP code</Text>
      <Text style={[styles.sub, { color: colors.textSecondary }]}>
        Used only to sort places by distance once listings are available.
      </Text>
      <TextInput
        value={profile.zip ?? ''}
        onChangeText={(t) => update({ zip: t.replace(/[^0-9]/g, '').slice(0, 5) || null })}
        placeholder="80202"
        placeholderTextColor={colors.textSecondary}
        keyboardType="number-pad"
        maxLength={5}
        accessibilityLabel="ZIP code"
        style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundElement, borderColor: colors.border }]}
      />

      <Pressable
        onPress={() => {
          update({ onboarded: true });
          router.back();
        }}
        accessibilityRole="button"
        style={({ pressed }) => [styles.save, { backgroundColor: colors.tint, opacity: pressed ? 0.85 : 1 }]}>
        <Text style={[styles.saveText, { color: colors.onTint }]}>Save to this phone</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  privacy: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'flex-start',
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  h2: { fontSize: 18, fontWeight: '800', marginTop: Spacing.four },
  sub: { fontSize: 13, lineHeight: 19, marginTop: Spacing.one },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 40,
  },
  chipText: { fontSize: 14, fontWeight: '700' },
  list: { gap: Spacing.two, marginTop: Spacing.three },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 52,
  },
  optionText: { flex: 1, fontSize: 14, lineHeight: 19 },
  input: {
    marginTop: Spacing.three,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    fontSize: 17,
    fontWeight: '600',
  },
  save: { marginTop: Spacing.five, paddingVertical: Spacing.three, borderRadius: Radius.pill, alignItems: 'center' },
  saveText: { fontSize: 16, fontWeight: '800' },
});
