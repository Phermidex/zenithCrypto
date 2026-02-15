export type CryptoAsset = {
  id: string;
  name: string;
  symbol: string;
};

export type WalletAsset = {
  asset: CryptoAsset;
  balance: number;
  balanceUSD: number;
};

export type MarketData = {
  asset: CryptoAsset;
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
