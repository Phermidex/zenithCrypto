import type { CryptocurrencyType } from './firebase-types';

export const btc: CryptocurrencyType = { id: 'btc', name: 'Bitcoin', symbol: 'BTC', isEnabled: true, createdAt: '', updatedAt: '' };
export const eth: CryptocurrencyType = { id: 'eth', name: 'Ethereum', symbol: 'ETH', isEnabled: true, createdAt: '', updatedAt: '' };
export const sol: CryptocurrencyType = { id: 'sol', name: 'Solana', symbol: 'SOL', isEnabled: true, createdAt: '', updatedAt: '' };

export const cryptoAssets: CryptocurrencyType[] = [btc, eth, sol];
