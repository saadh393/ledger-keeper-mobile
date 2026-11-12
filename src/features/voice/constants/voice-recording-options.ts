import type { RecordingOptions } from 'expo-audio';
import { AudioQuality, IOSOutputFormat } from 'expo-audio';

export const voiceRecordingOptions: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 32000,
  isMeteringEnabled: true,
  android: {
    outputFormat: 'mpeg4',
    audioEncoder: 'aac',
  },
  ios: {
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MEDIUM,
  },
  web: {
    mimeType: 'audio/mp4',
    bitsPerSecond: 32000,
  },
};

export const minVoiceSeconds = 1;

export const voiceLevelIntervalMs = 100;
