import type { CryptocurrencyType } from './firebase-types';

export type WalletAsset = {
  asset: CryptocurrencyType;
  balance: number;
  balanceUSD: number;
};

export type MarketData = {
  asset: CryptocurrencyType;
  price: number;
  change24h: number;
  marketCap: number;
  sparkline: number[];
};

export type CreditCard = {
  id: string;
  last4: string;
  expiry: string;
  brand: 'Visa' | 'Mastercard' | 'Amex';
  isDefault: boolean;
};
