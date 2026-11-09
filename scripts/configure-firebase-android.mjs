import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const json = process.env.GOOGLE_SERVICES_JSON;
if (!json) throw new Error('Missing GitHub Actions secret GOOGLE_SERVICES_JSON.');
const config = JSON.parse(json);
if (config.project_info?.project_id !== 'happy-time-connect') {
  throw new Error('google-services.json is not for happy-time-connect.');
}
if (!config.client?.some(item => item.client_info?.android_client_info?.package_name === 'com.happytime.connect')) {
  throw new Error('google-services.json does not contain Android package com.happytime.connect.');
}

mkdirSync('android/app', { recursive: true });
writeFileSync('android/app/google-services.json', json);

const rootGradle = 'android/build.gradle';
let root = readFileSync(rootGradle, 'utf8');
if (!root.includes('com.google.gms.google-services')) {
  root = root.replace(/plugins\s*\{/, match => match + "\n    id 'com.google.gms.google-services' version '4.4.2' apply false");
  if (!root.includes('com.google.gms.google-services')) throw new Error('Could not add Google Services plugin to android/build.gradle.');
  writeFileSync(rootGradle, root);
}

const appGradle = 'android/app/build.gradle';
let app = readFileSync(appGradle, 'utf8');
if (!app.includes("id 'com.google.gms.google-services'")) {
  app = app.replace(/plugins\s*\{/, match => match + "\n    id 'com.google.gms.google-services'");
  if (!app.includes("id 'com.google.gms.google-services'")) throw new Error('Could not apply Google Services plugin to app/build.gradle.');
  writeFileSync(appGradle, app);
}
console.log('Firebase Android configuration installed.');
