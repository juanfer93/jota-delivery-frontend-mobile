import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isMobile = !isWeb;
export const platformName = isWeb ? 'web' : Platform.OS;
