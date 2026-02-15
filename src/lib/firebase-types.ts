// Based on docs/backend.json
export interface CryptocurrencyType {
    id: string;
    name: string;
    symbol: string;
    iconUrl?: string;
    description?: string;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserWallet {
    id: string;
    userId: string;
    cryptocurrencyTypeId: string;
    balance: number;
    createdAt: string;
    updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreditCard {
  id: string;
  userId: string;
  stripePaymentMethodId: string;
  brand: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  cryptocurrencyTypeId: string;
  creditCardId: string;
  type: string;
  cryptoAmount: number;
  fiatAmount: number;
  fiatCurrency: string;
  status: string;
  transactionFee?: number;
  transactionDate: string;
  externalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}
