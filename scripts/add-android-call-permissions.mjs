import { readFileSync, writeFileSync } from 'node:fs';

const manifestPath = 'android/app/src/main/AndroidManifest.xml';
let manifest = readFileSync(manifestPath, 'utf8');
const permissions = [
  'android.permission.INTERNET',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.MODIFY_AUDIO_SETTINGS'
];

for (const permission of permissions) {
  const declaration = '    <uses-permission android:name="' + permission + '" />';
  if (!manifest.includes('android:name="' + permission + '"')) {
    manifest = manifest.replace('<application', declaration + '\n    <application');
  }
}

// Push notifications are temporarily disabled while investigating the
// Android crash triggered when notification permission is granted.
manifest = manifest.replace(
  /^\s*<uses-permission android:name="android\.permission\.POST_NOTIFICATIONS"\s*\/>\s*\r?\n?/gm,
  ''
);

writeFileSync(manifestPath, manifest);
console.log('Android internet, camera and microphone permissions are configured; push notifications are disabled.');
