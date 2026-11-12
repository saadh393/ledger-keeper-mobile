import { File } from 'expo-file-system';

export function deleteRecordingFile(uri: string | null) {
  if (!uri)
    return;
  const file = new File(uri);
  if (file.exists)
    file.delete();
}
