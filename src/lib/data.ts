import type { CryptoAsset, WalletAsset, MarketData, CreditCard } from './types';

export const btc: CryptoAsset = { id: 'btc', name: 'Bitcoin', symbol: 'BTC' };
export const eth: CryptoAsset = { id: 'eth', name: 'Ethereum', symbol: 'ETH' };
export const sol: CryptoAsset = { id: 'sol', name: 'Solana', symbol: 'SOL' };

export const cryptoAssets: CryptoAsset[] = [btc, eth, sol];

export const walletAssets: WalletAsset[] = [
  { asset: btc, balance: 0.5, balanceUSD: 35000 },
  { asset: eth, balance: 10, balanceUSD: 35000 },
  { asset: sol, balance: 100, balanceUSD: 16000 },
];

export const marketData: MarketData[] = [
  { asset: btc, price: 70000, change24h: 2.5, marketCap: 1.3e12, sparkline: [] },
  { asset: eth, price: 3500, change24h: -1.2, marketCap: 420e9, sparkline: [] },
  { asset: sol, price: 160, change24h: 5.8, marketCap: 73e9, sparkline: [] },
];

marketData.forEach(d => {
  let lastVal = Math.random() * 50 + 25;
  d.sparkline = Array.from({ length: 30 }, () => {
    lastVal += (Math.random() - 0.5) * 10;
    return lastVal > 0 ? lastVal : 0;
  });
});

export const creditCards: CreditCard[] = [
  { id: '1', last4: '4242', expiry: '12/26', brand: 'Visa', isDefault: true },
  { id: '2', last4: '5555', expiry: '08/25', brand: 'Mastercard', isDefault: false },
];
