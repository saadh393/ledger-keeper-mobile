const { AndroidConfig, withAndroidManifest } = require('expo/config-plugins');

const SERVICE = 'expo.modules.notificationcapture.CaptureListenerService';

function addService(manifest, label) {
  const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
  application.service = (application.service ?? []).filter(item => item.$['android:name'] !== SERVICE);
  application.service.push({
    '$': {
      'android:name': SERVICE,
      'android:label': label,
      'android:exported': 'true',
      'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
    },
    'intent-filter': [{ action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }] }],
  });
}

function addLauncherQuery(manifest) {
  const queries = manifest.manifest.queries ?? [{}];
  const query = queries[0];
  const intents = query.intent ?? [];
  const exists = intents.some(intent => intent.action?.[0]?.$['android:name'] === 'android.intent.action.MAIN'
    && intent.category?.[0]?.$['android:name'] === 'android.intent.category.LAUNCHER');
  if (!exists) {
    intents.push({
      action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
      category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
    });
  }
  query.intent = intents;
  manifest.manifest.queries = queries;
}

module.exports = function withNotificationCapture(config, { label = 'Ledger Keeper' } = {}) {
  return withAndroidManifest(config, (next) => {
    addService(next.modResults, label);
    addLauncherQuery(next.modResults);
    return next;
  });
};
