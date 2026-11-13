/* eslint-disable react-refresh/only-export-components */
import type { StateStorage } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const DEVICE_PREFERENCE_KEYS = new Set<string>([
  'theme',
  'local',
  'language',
]);

const KNOWN_USER_KEYS = [
  'active_book_id',
  'activeBookId',
  'active_book',
  'user',
  'user_profile',
  'books_cache',
];

function deleteStorageKey(key: string): void {
  if (typeof storage.remove === 'function') {
    storage.remove(key);
  }
  else if (typeof (storage as unknown as { delete?: (k: string) => void }).delete === 'function') {
    (storage as unknown as { delete: (k: string) => void }).delete(key);
  }
}

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export async function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export async function removeItem(key: string) {
  deleteStorageKey(key);
}

export function clearUserStorage(): void {
  const allKeys = storage.getAllKeys?.() ?? [];
  for (const key of allKeys) {
    if (!DEVICE_PREFERENCE_KEYS.has(key)) {
      deleteStorageKey(key);
    }
  }

  for (const key of KNOWN_USER_KEYS) {
    if (!DEVICE_PREFERENCE_KEYS.has(key)) {
      deleteStorageKey(key);
    }
  }
}

export function clearAllStorage(): void {
  storage.clearAll();
}

export const zustandStorage: StateStorage = {
  getItem: name => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: name => deleteStorageKey(name),
};
