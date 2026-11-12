import { useAssistantStore } from '@/features/assistant/store/use-assistant-store';
import { deleteRecordingFile } from '@/features/voice/utils/delete-recording-file';

export function releasePending() {
  const { pending, setDraft, setPending } = useAssistantStore.getState();
  if (!pending)
    return;
  const file = pending.voice ?? pending.receipt;
  if (file)
    deleteRecordingFile(file.uri);
  else
    setDraft(pending.text);
  setPending(null);
}
