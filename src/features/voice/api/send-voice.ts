import type { SendMessageResponse } from '@/features/assistant/schemas/conversation-schema';
import type { VoiceRecording } from '@/features/voice/utils/voice-recorder-reducer';
import { File } from 'expo-file-system';
import { AI_TIMEOUT_MS } from '@/features/assistant/api/send-message';
import { sendMessageResponseSchema } from '@/features/assistant/schemas/conversation-schema';
import { apiClient, parse } from '@/lib/api';

export async function sendVoice(conversationId: string, recording: VoiceRecording, clientAudioId: string): Promise<SendMessageResponse> {
  const body = await new File(recording.uri).bytes();
  const response = await apiClient.post(`/conversations/${conversationId}/voice`, body, {
    headers: { 'Content-Type': 'application/octet-stream', 'x-audio-type': recording.mimeType, 'x-client-audio-id': clientAudioId },
    timeout: AI_TIMEOUT_MS,
  });
  return parse(sendMessageResponseSchema, response.data);
}
