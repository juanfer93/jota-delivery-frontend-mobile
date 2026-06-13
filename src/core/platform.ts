import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isAndroid;
export const platformName = isWeb ? 'web' : isAndroid ? 'android' : 'unsupported';
