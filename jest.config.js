require('dotenv').config();

module.exports = {
  preset: 'jest-expo',
  testTimeout: 20000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|standard-navigation|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['./jest.setup.js'],
  moduleNameMapper: {
    // 1. PRIMERO: Captura los imports de CSS con alias
    '^@/(.*)\\.css$': '<rootDir>/__mocks__/fileMock.js',
    
    // 2. DESPUÉS: Tus otros alias de assets
    '^@/assets/(.*)$': '<rootDir>/assets/$1',
    
    // 3. DESPUÉS: Tu alias general (no atrapará los CSS por el orden)
    '^@/(.*)$': '<rootDir>/src/$1',
    
    // 4. Mapeo para CSS estándar
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Mantenemos los assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
