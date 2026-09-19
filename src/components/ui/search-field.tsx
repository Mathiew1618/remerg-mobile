import { Pressable, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { useTheme } from '@/hooks/use-theme';

/**
 * Search input, shared by the crisis, need and category lists.
 *
 * `placeholderTextColor` is a color prop rather than a style, so it is the one
 * value here that still comes from the theme object instead of a class.
 */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel: string;
}) {
  const colors = useTheme();

  return (
    <View className="h-12 flex-row items-center gap-2 rounded-field border border-line bg-elevated px-3.5">
      <Icon name="mci:magnify" size={18} className="text-muted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        className="flex-1 text-base text-ink"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText('')}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          className="active:opacity-60">
          <Icon name="ion:close-circle" size={18} className="text-muted" />
        </Pressable>
      ) : null}
    </View>
  );
}
