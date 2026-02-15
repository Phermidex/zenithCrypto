"use client";

import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { MarketData, WalletAsset } from '@/lib/types';
import type { CryptocurrencyType, UserWallet } from '@/lib/firebase-types';

import AppHeader from '@/components/layout/app-header';
import WalletBalance from '@/components/dashboard/wallet-balance';
import MarketOverview from '@/components/dashboard/market-overview';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading: isUserLoadingAuth } = useUser();
  const firestore = useFirestore();

  const cryptoTypesQuery = useMemoFirebase(
    () => (firestore ? collection(firestore, 'cryptocurrencyTypes') : null),
    [firestore]
  );
  const { data: cryptoTypes, isLoading: isCryptoTypesLoading } = useCollection<CryptocurrencyType>(cryptoTypesQuery);

  const userWalletsQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'users', user.uid, 'wallets') : null),
    [firestore, user]
  );
  const { data: userWallets, isLoading: isWalletsLoading } = useCollection<UserWallet>(userWalletsQuery);

  const isLoading = isUserLoadingAuth || isCryptoTypesLoading || isWalletsLoading;

  const { walletAssets, marketData } = useMemo(() => {
    if (!cryptoTypes) {
      return { walletAssets: [], marketData: [] };
    }

    const newMarketData: MarketData[] = cryptoTypes.map(ct => {
      let lastVal = Math.random() * 50 + 25;
      const sparkline = Array.from({ length: 30 }, () => {
        lastVal += (Math.random() - 0.5) * 10;
        return lastVal > 0 ? lastVal : 0;
      });
      return {
        asset: ct,
        price: (ct.symbol === 'BTC' ? 60000 : ct.symbol === 'ETH' ? 3000 : 150) + (Math.random() - 0.5) * 500,
        change24h: (Math.random() - 0.5) * 10,
        marketCap: Math.random() * 1e12,
        sparkline,
      };
    });

    const priceMap = new Map(newMarketData.map(md => [md.asset.id, md.price]));
    const cryptoTypeMap = new Map(cryptoTypes.map(ct => [ct.id, ct]));
    
    let newWalletAssets: WalletAsset[] = [];
    if(userWallets) {
        newWalletAssets = userWallets.map(wallet => {
            const asset = cryptoTypeMap.get(wallet.cryptocurrencyTypeId);
            const price = priceMap.get(wallet.cryptocurrencyTypeId) || 0;
            if (!asset) return null;
            return {
                asset,
                balance: wallet.balance,
                balanceUSD: wallet.balance * price,
            };
        }).filter((a): a is WalletAsset => a !== null);
    }

    return { walletAssets: newWalletAssets, marketData: newMarketData };
  }, [cryptoTypes, userWallets]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <AppHeader title="Dashboard" />
        <div className="flex-1 space-y-8 p-4 md:p-8 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Your Wallet</h2>
            <Skeleton className="h-36 w-full mb-6" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">Market Overview</h2>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Dashboard" />
      <div className="flex-1 space-y-8 p-4 md:p-8 overflow-y-auto">
        <WalletBalance assets={walletAssets} />
        <MarketOverview data={marketData} />
      </div>
    </div>
  );
}
