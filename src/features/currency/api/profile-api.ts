import type { UpdateProfileInput, UserProfile } from '@/features/currency/types';
import { apiClient } from '@/lib/api';

export const userProfileQueryKey = ['users', 'me'] as const;
export const booksQueryKey = ['books'] as const;

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  const response = await apiClient.patch<UserProfile>('/users/me', input);
  return response.data;
}
