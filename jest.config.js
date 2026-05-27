module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  // Mapeamos los alias y los mocks de archivos estáticos
  moduleNameMapper: {
    // Si la imagen está en la raíz:
    '^@/assets/(.*)$': '<rootDir>/assets/$1', 
    // Si tuvieras otros alias hacia src:
    '^@/(.*)$': '<rootDir>/src/$1',
    // Y finalmente, el mock para CUALQUIER imagen (png, jpg, jpeg, gif, svg)
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
};