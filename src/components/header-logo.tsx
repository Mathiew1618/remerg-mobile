import { Text, View } from 'react-native';

/**
 * The app's wordmark at the top of the home screen.
 *
 * A plain text mark. This app is an independent client, not published or
 * endorsed by Remerg, so it does not use Remerg's logo. (A local testing copy
 * of this file may show it; that copy is never committed.)
 */
export function HeaderLogo() {
  return (
    <View>
      <Text className="text-[26px] font-extrabold tracking-tight text-brand">Remerg</Text>
      <Text className="text-[13px] font-semibold text-muted">Colorado re-entry resources</Text>
    </View>
  );
}
