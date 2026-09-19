import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Extra bottom padding so content clears the tab bar. */
  contentStyle?: ViewStyle;
};

export function Screen({ children, scroll = true, contentStyle }: Props) {
  const colors = useTheme();
  const insets = useSafeAreaInsets();

  const inner: ViewStyle = {
    padding: Spacing.three,
    paddingBottom: insets.bottom + Spacing.six,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    ...contentStyle,
  };

  if (!scroll) {
    return <View style={[styles.fill, { backgroundColor: colors.background }, inner]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.fill, { backgroundColor: colors.background }]}
      contentContainerStyle={inner}
      keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
