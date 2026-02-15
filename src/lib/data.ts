import type { CreditCard } from './types';
import type { CryptocurrencyType } from './firebase-types';

export const btc: CryptocurrencyType = { id: 'btc', name: 'Bitcoin', symbol: 'BTC', isEnabled: true, createdAt: '', updatedAt: '' };
export const eth: CryptocurrencyType = { id: 'eth', name: 'Ethereum', symbol: 'ETH', isEnabled: true, createdAt: '', updatedAt: '' };
export const sol: CryptocurrencyType = { id: 'sol', name: 'Solana', symbol: 'SOL', isEnabled: true, createdAt: '', updatedAt: '' };

export const cryptoAssets: CryptocurrencyType[] = [btc, eth, sol];

export const creditCards: CreditCard[] = [
  { id: '1', last4: '4242', expiry: '12/26', brand: 'Visa', isDefault: true },
  { id: '2', last4: '5555', expiry: '08/25', brand: 'Mastercard', isDefault: false },
];
