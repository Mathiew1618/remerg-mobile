/**
 * NativeWind needs both halves of this preset pair: `jsxImportSource` routes
 * JSX through its runtime so `className` reaches components, and
 * `nativewind/babel` compiles the Tailwind output for native.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
