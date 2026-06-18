import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const target = resolve(projectRoot, 'assets/sounds/jota_notifications.mp3');
const legacySource = resolve(projectRoot, 'assets/sounds/jota_notification.mp3');
const dashedLegacySource = resolve(projectRoot, 'assets/sounds/jota-notification.mp3');

mkdirSync(dirname(target), { recursive: true });

if (!existsSync(target) && existsSync(legacySource)) {
  copyFileSync(legacySource, target);
}

if (!existsSync(target) && existsSync(dashedLegacySource)) {
  copyFileSync(dashedLegacySource, target);
}

if (!existsSync(target)) {
  throw new Error('Missing notification sound. Put the file at assets/sounds/jota_notifications.mp3 before building the APK.');
}

console.log('[notifications] Sound asset ready at assets/sounds/jota_notifications.mp3');
