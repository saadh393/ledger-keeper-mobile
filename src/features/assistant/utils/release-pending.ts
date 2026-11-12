import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';

export function releasePending() {
  const { pending, setDraft, setPending } = useAssistantStore.getState();
  if (!pending)
    return;
  if (pending.voice)
    deleteRecordingFile(pending.voice.uri);
  else
    setDraft(pending.text);
  setPending(null);
}
