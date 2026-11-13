const PURCHASES_ERROR_CODE = {
  UNKNOWN_ERROR: '0',
  PURCHASE_CANCELLED_ERROR: '1',
  STORE_PROBLEM_ERROR: '2',
  PURCHASE_NOT_ALLOWED_ERROR: '3',
  PRODUCT_ALREADY_PURCHASED_ERROR: '6',
  NETWORK_ERROR: '10',
  PAYMENT_PENDING_ERROR: '20',
  OFFLINE_CONNECTION_ERROR: '35',
};

const Purchases = {
  configure: jest.fn(),
  isConfigured: jest.fn(async () => true),
  getAppUserID: jest.fn(async () => 'user-1'),
  logIn: jest.fn(async () => ({})),
  logOut: jest.fn(async () => ({})),
  isAnonymous: jest.fn(async () => false),
  getOfferings: jest.fn(async () => ({ all: {}, current: null })),
  purchasePackage: jest.fn(async () => ({})),
};

function isPurchasesError(error: unknown) {
  return typeof error === 'object' && error !== null && Object.values(PURCHASES_ERROR_CODE).includes((error as { code?: string }).code ?? '');
}

module.exports = {
  __esModule: true,
  default: Purchases,
  PURCHASES_ERROR_CODE,
  isPurchasesError,
};
