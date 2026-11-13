export const requestRecordingPermissionsAsync = jest.fn(async () => ({ granted: true }));
export const setAudioModeAsync = jest.fn(async () => undefined);
export const useAudioRecorder = jest.fn(() => ({
  prepareToRecordAsync: jest.fn(async () => undefined),
  record: jest.fn(),
  stop: jest.fn(async () => undefined),
  uri: null,
}));
export const useAudioRecorderState = jest.fn(() => ({ isRecording: false, durationMillis: 0, metering: undefined }));
export const RecordingPresets = { HIGH_QUALITY: {} };
export const AudioQuality = { MIN: 0, LOW: 32, MEDIUM: 64, HIGH: 96, MAX: 127 };
export const IOSOutputFormat = { MPEG4AAC: 'aac ' };
