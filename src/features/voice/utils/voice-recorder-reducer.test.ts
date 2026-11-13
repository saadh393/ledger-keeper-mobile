import type { VoiceRecorderState } from '@/features/voice/utils/voice-recorder-reducer';
import { initialVoiceRecorderState, voiceRecorderReducer } from '@/features/voice/utils/voice-recorder-reducer';

const recording = { uri: 'file:///a.m4a', durationSeconds: 3, sizeBytes: 1000, mimeType: 'audio/mp4' as const };

function run(...events: Parameters<typeof voiceRecorderReducer>[1][]): VoiceRecorderState {
  return events.reduce(voiceRecorderReducer, initialVoiceRecorderState);
}

describe('voiceRecorderReducer', () => {
  it('records after permission is granted and saves on stop', () => {
    const state = run({ type: 'start', voiceAvailable: true }, { type: 'granted' }, { type: 'stop', hitLimit: false }, { type: 'saved', recording });
    expect(state).toEqual({ status: 'stopped', reason: null, hitLimit: false, recording });
  });

  it.each(['permission-denied', 'permission-blocked'] as const)('reports %s', (reason) => {
    expect(run({ type: 'start', voiceAvailable: true }, { type: 'fail', reason })).toMatchObject({ status: 'error', reason });
  });

  it('refuses to start when voice is unavailable', () => {
    expect(run({ type: 'start', voiceAvailable: false })).toMatchObject({ status: 'error', reason: 'voice-unavailable' });
  });

  it('marks an auto-stop at the limit', () => {
    expect(run({ type: 'start', voiceAvailable: true }, { type: 'granted' }, { type: 'stop', hitLimit: true })).toMatchObject({ status: 'stopped', hitLimit: true });
  });

  it('reports a too-short recording', () => {
    expect(run({ type: 'start', voiceAvailable: true }, { type: 'granted' }, { type: 'stop', hitLimit: false }, { type: 'fail', reason: 'too-short' }))
      .toMatchObject({ status: 'error', reason: 'too-short', recording: null });
  });

  it('stops on interruption and keeps the recording', () => {
    const state = run({ type: 'start', voiceAvailable: true }, { type: 'granted' }, { type: 'stop', hitLimit: false });
    expect(voiceRecorderReducer(state, { type: 'saved', recording }).recording).toEqual(recording);
  });

  it('ignores a second start while recording or asking', () => {
    const asking = run({ type: 'start', voiceAvailable: true });
    expect(voiceRecorderReducer(asking, { type: 'start', voiceAvailable: true })).toBe(asking);
    const recordingState = voiceRecorderReducer(asking, { type: 'granted' });
    expect(voiceRecorderReducer(recordingState, { type: 'start', voiceAvailable: true })).toBe(recordingState);
  });

  it('ignores events out of order', () => {
    expect(run({ type: 'granted' })).toEqual(initialVoiceRecorderState);
    expect(run({ type: 'stop', hitLimit: false })).toEqual(initialVoiceRecorderState);
    expect(run({ type: 'saved', recording })).toEqual(initialVoiceRecorderState);
  });

  it('discards back to idle', () => {
    expect(run({ type: 'start', voiceAvailable: true }, { type: 'granted' }, { type: 'reset' })).toEqual(initialVoiceRecorderState);
  });
});
