export type VoiceRecorderStatus = 'idle' | 'requesting-permission' | 'recording' | 'stopped' | 'error';

export type VoiceRecorderError = 'permission-denied' | 'permission-blocked' | 'voice-unavailable' | 'too-short' | 'recording-failed';

export type VoiceRecording = {
  uri: string;
  durationSeconds: number;
  sizeBytes: number;
  mimeType: 'audio/mp4';
};

export type VoiceRecorderState = {
  status: VoiceRecorderStatus;
  reason: VoiceRecorderError | null;
  hitLimit: boolean;
  recording: VoiceRecording | null;
};

export type VoiceRecorderEvent
  = | { type: 'start'; voiceAvailable: boolean }
    | { type: 'granted' }
    | { type: 'stop'; hitLimit: boolean }
    | { type: 'saved'; recording: VoiceRecording }
    | { type: 'fail'; reason: VoiceRecorderError }
    | { type: 'reset' };

export const initialVoiceRecorderState: VoiceRecorderState = {
  status: 'idle',
  reason: null,
  hitLimit: false,
  recording: null,
};

const startableStatuses: VoiceRecorderStatus[] = ['idle', 'stopped', 'error'];

export function voiceRecorderReducer(state: VoiceRecorderState, event: VoiceRecorderEvent): VoiceRecorderState {
  switch (event.type) {
    case 'start':
      if (!startableStatuses.includes(state.status))
        return state;
      return event.voiceAvailable
        ? { ...initialVoiceRecorderState, status: 'requesting-permission' }
        : { ...initialVoiceRecorderState, status: 'error', reason: 'voice-unavailable' };
    case 'granted':
      return state.status === 'requesting-permission' ? { ...state, status: 'recording' } : state;
    case 'stop':
      return state.status === 'recording' ? { ...state, status: 'stopped', hitLimit: event.hitLimit } : state;
    case 'saved':
      return state.status === 'stopped' ? { ...state, recording: event.recording } : state;
    case 'fail':
      return { ...initialVoiceRecorderState, status: 'error', reason: event.reason };
    case 'reset':
      return initialVoiceRecorderState;
  }
}
