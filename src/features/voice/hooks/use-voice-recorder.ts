import type { VoiceRecorderError, VoiceRecorderEvent, VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
import { requestRecordingPermissionsAsync, setAudioModeAsync, useAudioRecorder, useAudioRecorderState } from 'expo-audio';
import { File } from 'expo-file-system';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { getVoiceLimit, useRateCard } from '@/features/credits';
import { minVoiceSeconds, voiceLevelIntervalMs, voiceRecordingOptions } from '@/features/voice/constants/voice-recording-options';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';
import { getPermissionDenial } from '@/features/voice/utils/get-permission-denial';
import { meteringToLevel } from '@/features/voice/utils/metering-to-level';
import { initialVoiceRecorderState, voiceRecorderReducer } from '@/features/voice/utils/voice-recorder-reducer';

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(voiceRecordingOptions);
  const recorderState = useAudioRecorderState(recorder, voiceLevelIntervalMs);
  const maxSeconds = getVoiceLimit(useRateCard().data);
  const [state, setState] = useState(initialVoiceRecorderState);
  const stateRef = useRef(state);

  const send = useCallback((event: VoiceRecorderEvent) => {
    stateRef.current = voiceRecorderReducer(stateRef.current, event);
    setState(stateRef.current);
  }, []);

  const finish = useCallback(async (hitLimit: boolean): Promise<VoiceRecording | null> => {
    if (stateRef.current.status !== 'recording')
      return null;
    send({ type: 'stop', hitLimit });
    try {
      const durationSeconds = recorder.getStatus().durationMillis / 1000;
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      if (durationSeconds < minVoiceSeconds) {
        deleteRecordingFile(recorder.uri);
        send({ type: 'fail', reason: 'too-short' });
        return null;
      }
      const file = new File(recorder.uri!);
      const recording: VoiceRecording = { uri: file.uri, durationSeconds, sizeBytes: file.size, mimeType: 'audio/mp4' };
      send({ type: 'saved', recording });
      return recording;
    }
    catch {
      send({ type: 'fail', reason: 'recording-failed' });
      return null;
    }
  }, [recorder, send]);

  const start = useCallback(async (): Promise<VoiceRecorderError | null> => {
    send({ type: 'start', voiceAvailable: maxSeconds !== null });
    if (stateRef.current.status !== 'requesting-permission')
      return stateRef.current.reason;
    try {
      const denial = getPermissionDenial(await requestRecordingPermissionsAsync());
      if (denial) {
        send({ type: 'fail', reason: denial });
        return denial;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      send({ type: 'granted' });
      return null;
    }
    catch {
      send({ type: 'fail', reason: 'recording-failed' });
      return 'recording-failed';
    }
  }, [maxSeconds, recorder, send]);

  const stop = useCallback(() => finish(false), [finish]);

  const discard = useCallback(async () => {
    const wasRecording = stateRef.current.status === 'recording';
    const uri = stateRef.current.recording?.uri ?? null;
    send({ type: 'reset' });
    if (wasRecording) {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      deleteRecordingFile(recorder.uri);
    }
    deleteRecordingFile(uri);
  }, [recorder, send]);

  const release = useCallback(() => send({ type: 'reset' }), [send]);

  const isRecording = state.status === 'recording';

  useEffect(() => {
    if (!isRecording)
      return;
    const live = recorder.getStatus();
    if (maxSeconds !== null && live.durationMillis >= maxSeconds * 1000 - voiceLevelIntervalMs)
      finish(true);
    else if (!live.isRecording)
      finish(false);
  }, [finish, isRecording, maxSeconds, recorder, recorderState]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'background')
        finish(false);
    });
    return () => subscription.remove();
  }, [finish]);

  return {
    ...state,
    elapsedSeconds: Math.floor(isRecording ? recorderState.durationMillis / 1000 : state.recording?.durationSeconds ?? 0),
    level: isRecording ? meteringToLevel(recorderState.metering) : 0,
    maxSeconds,
    start,
    stop,
    discard,
    release,
  };
}
