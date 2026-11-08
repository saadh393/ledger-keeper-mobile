export type UserProfile = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  locale: string;
  currency: string;
  currencyConfirmed: boolean;
  defaultBookId: string | null;
  createdAt: string;
};

export type UpdateProfileInput = {
  name?: string;
  locale?: string;
  currency?: string;
};
