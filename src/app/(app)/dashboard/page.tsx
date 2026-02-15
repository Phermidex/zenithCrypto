import AppHeader from '@/components/layout/app-header';
import WalletBalance from '@/components/dashboard/wallet-balance';
import MarketOverview from '@/components/dashboard/market-overview';
import { walletAssets, marketData } from '@/lib/data';

export default function DashboardPage() {
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
