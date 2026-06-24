import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');
const target = resolve(projectRoot, 'assets/sounds/jota_notifications.mp3');
const legacySource = resolve(projectRoot, 'assets/sounds/jota_notification.mp3');
const dashedLegacySource = resolve(projectRoot, 'assets/sounds/jota-notification.mp3');
const ALERT_REPETITIONS = 6;

mkdirSync(dirname(target), { recursive: true });

const source = existsSync(legacySource)
  ? legacySource
  : existsSync(dashedLegacySource)
    ? dashedLegacySource
    : null;

if (!source) {
  throw new Error('Missing notification sound. Put the file at assets/sounds/jota_notifications.mp3 before building the APK.');
}

const tone = readFileSync(source);
writeFileSync(target, Buffer.concat(Array.from({ length: ALERT_REPETITIONS }, () => tone)));

console.log(`[notifications] Repeated ${ALERT_REPETITIONS} times at assets/sounds/jota_notifications.mp3`);
