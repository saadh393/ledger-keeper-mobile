import { storage } from '@/lib/storage';

const RESET_EMAIL = 'password_reset_email';

export function saveResetEmail(email: string): void {
  storage.set(RESET_EMAIL, email.trim());
}

export function takeResetEmail(): string | undefined {
  const email = storage.getString(RESET_EMAIL);
  storage.remove(RESET_EMAIL);
  return email;
}
