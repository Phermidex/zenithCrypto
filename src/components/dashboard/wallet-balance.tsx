import type { WalletAsset } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin, DollarSign } from 'lucide-react';
import { ReactNode } from 'react';

const CryptoIcon = ({ symbol }: { symbol: string }): ReactNode => {
    const iconMap: { [key: string]: ReactNode } = {
        'BTC': <Bitcoin className="h-6 w-6 text-accent" />,
        'ETH': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent fill-current"><title>Ethereum</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35zM12.056 0L4.69 12.223l7.366 4.354 7.36-4.35L12.056 0z"/></svg>,
        'SOL': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current"><title>Solana</title><path d="M4.735 18.435c-1.37-2.37-1.37-5.26 0-7.63l7.265-12.55c1.37-2.37 4.14-2.37 5.51 0l-7.265 12.55c-1.37 2.37-4.14 2.37-5.51 0zm7.265-6.52L4.735 11.915c-1.37 2.37-1.37 5.26 0 7.63l7.265-12.55zm.01 7.63l7.265-12.56c1.37-2.37 4.14-2.37 5.51 0l-7.265 12.56c-1.37 2.37-4.14 2.37-5.51 0zm7.265-6.52l-7.265-12.55c1.37-2.37 4.14-2.37 5.51 0l7.265 12.55c-1.37 2.37-4.14 2.37-5.51 0z"/></svg>,
    };
    return iconMap[symbol] || <DollarSign className="h-6 w-6 text-accent" />;
};


export default function WalletBalance({ assets }: { assets: WalletAsset[] }) {
  const totalBalance = assets.reduce((acc, asset) => acc + asset.balanceUSD, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Your Wallet</h2>
      <Card className="mb-6 bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-muted-foreground font-medium">Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <Card key={asset.asset.id} className="bg-card/50 border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{asset.asset.name}</CardTitle>
              <CryptoIcon symbol={asset.asset.symbol} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {asset.balance.toLocaleString()} {asset.asset.symbol}
              </div>
              <p className="text-xs text-muted-foreground">
                ~ ${asset.balanceUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
