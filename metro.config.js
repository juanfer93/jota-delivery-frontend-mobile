// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ─────────────────────────────────────────────
// MODO GUERRA: Mockear imágenes en desarrollo web
// ─────────────────────────────────────────────
if (process.env.EXPO_ENV === 'development' || process.env.NODE_ENV !== 'production') {
  // Intercepta imports de imágenes y los redirige al mock
  const originalResolveRequest = config.resolver.resolveRequest;
  
  config.resolver.resolveRequest = (context, moduleName, platform) => {
    // Si es una imagen, devolver el mock
    if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(moduleName)) {
      return {
        filePath: path.resolve(__dirname, '__mocks__/imageMock.js'),
        type: 'sourceFile',
      };
    }
    // Para todo lo demás, comportamiento normal
    if (originalResolveRequest) {
      return originalResolveRequest(context, moduleName, platform);
    }
    return context.resolveRequest(context, moduleName, platform);
  };
}

module.exports = config;