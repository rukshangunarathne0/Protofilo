import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabase';

let setupForUser = null;
let listenersReady = false;

export async function registerDevicePush(userId) {
  if (!userId || !Capacitor.isNativePlatform() || setupForUser === userId) return;
  setupForUser = userId;

  try {
    let permission = await PushNotifications.checkPermissions();
    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions();
    }
    if (permission.receive !== 'granted') {
      console.info('Push notification permission was not granted.');
      setupForUser = null;
      return;
    }

    if (!listenersReady) {
      listenersReady = true;
      await PushNotifications.addListener('registration', async ({ value }) => {
        if (!value) return;
        const { data: authData } = await supabase.auth.getUser();
        const activeUserId = authData.user?.id;
        if (!activeUserId) return;
        const { error } = await supabase.from('htc_device_tokens').upsert({
          user_id: activeUserId,
          fcm_token: value,
          device_name: Capacitor.getPlatform() === 'android' ? 'Android' : Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'fcm_token' });
        if (error) console.error('Could not save FCM token:', error.message);
      });
      await PushNotifications.addListener('registrationError', error => {
        console.error('FCM registration failed:', error);
      });
      await PushNotifications.addListener('pushNotificationActionPerformed', action => {
        const data = action.notification?.data || {};
        if (data.type === 'incoming_call') {
          window.dispatchEvent(new CustomEvent('htc:incoming-call-push', { detail: data }));
        }
      });
    }

    await PushNotifications.register();
  } catch (error) {
    setupForUser = null;
    console.error('Push notification setup failed:', error);
  }
}
