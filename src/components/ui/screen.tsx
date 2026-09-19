import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Extra classes for the content container. */
  contentClassName?: string;
};

/**
 * Page shell: themed background, centered max-width column, and enough bottom
 * padding to clear the tab bar and the home indicator.
 *
 * The bottom inset is the one value that has to come from JS — everything else
 * is a class.
 */
export function Screen({ children, scroll = true, contentClassName = '' }: Props) {
  const insets = useSafeAreaInsets();
  const inner = `w-full self-center max-w-content p-4 ${contentClassName}`;

  if (!scroll) {
    return (
      <View className={`flex-1 bg-surface ${inner}`} style={{ paddingBottom: insets.bottom + 64 }}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerClassName={inner}
      contentContainerStyle={{ paddingBottom: insets.bottom + 64 }}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
