module.exports = {
    preset: 'jest-expo',
    // Esto es vital para que Jest no explote con los módulos de Expo que necesitan ser transpilados
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
    ],
};