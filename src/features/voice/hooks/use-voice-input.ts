import type { VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
import { useRef } from 'react';
import { useVoiceRecorder } from '@/features/voice/hooks/use-voice-recorder';
import { getHoldRelease } from '@/features/voice/utils/get-hold-release';

export function useVoiceInput(onRecording: (recording: VoiceRecording) => boolean) {
  const recorder = useVoiceRecorder();
  const holdStartedAt = useRef<number | null>(null);

  const submit = (recording: VoiceRecording | null) => {
    if (recording && onRecording(recording))
      recorder.release();
  };

  const tap = () => {
    void recorder.start();
  };

  const hold = () => {
    holdStartedAt.current = Date.now();
    void recorder.start();
  };

  const release = async () => {
    const startedAt = holdStartedAt.current;
    if (startedAt === null)
      return;
    holdStartedAt.current = null;
    if (getHoldRelease(Date.now() - startedAt) === 'cancel')
      await recorder.discard();
    else
      submit(await recorder.stop());
  };

  const send = async () => submit(recorder.recording ?? await recorder.stop());

  return { ...recorder, tap, hold, release, send };
}
