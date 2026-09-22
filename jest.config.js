module.exports = {
  preset: '@react-native/jest-preset',
  // The preset's default pattern only transforms react-native packages, but
  // React Navigation, Supabase and their sub-dependencies ship ESM too.
  // Rather than list every one, transform all of node_modules.
  transformIgnorePatterns: [],
  // The real native module doesn't exist in the test environment.
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest',
  },
};
