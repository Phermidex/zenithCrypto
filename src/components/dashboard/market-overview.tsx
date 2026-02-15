"use client";

import type { MarketData } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts';
import { cn } from '@/lib/utils';
import { Bitcoin, DollarSign } from 'lucide-react';
import { ReactNode } from 'react';

const CryptoIcon = ({ symbol }: { symbol: string }): ReactNode => {
    const iconMap: { [key: string]: ReactNode } = {
        'BTC': <Bitcoin className="h-6 w-6 text-foreground" />,
        'ETH': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-foreground fill-current"><title>Ethereum</title><path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35zM12.056 0L4.69 12.223l7.366 4.354 7.36-4.35L12.056 0z"/></svg>,
        'SOL': <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current"><title>Solana</title><path d="M4.735 18.435c-1.37-2.37-1.37-5.26 0-7.63l7.265-12.55c1.37-2.37 4.14-2.37 5.51 0l-7.265 12.55c-1.37 2.37-4.14 2.37-5.51 0zm7.265-6.52L4.735 11.915c-1.37 2.37-1.37 5.26 0 7.63l7.265-12.55zm.01 7.63l7.265-12.56c1.37-2.37 4.14-2.37 5.51 0l-7.265 12.56c-1.37 2.37-4.14 2.37-5.51 0zm7.265-6.52l-7.265-12.55c1.37-2.37 4.14-2.37 5.51 0l7.265 12.55c-1.37 2.37-4.14 2.37-5.51 0z"/></svg>,
    };
    return iconMap[symbol] || <DollarSign className="h-6 w-6 text-foreground" />;
};

export default function MarketOverview({ data }: { data: MarketData[] }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">Market Overview</h2>
      <Card className="bg-card/50 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h Change</TableHead>
                <TableHead className="hidden md:table-cell text-right">Market Cap</TableHead>
                <TableHead className="hidden lg:table-cell text-center w-[120px]">7d Chart</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.asset.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <CryptoIcon symbol={item.asset.symbol} />
                      <div>
                        <div className="font-medium">{item.asset.name}</div>
                        <div className="text-sm text-muted-foreground">{item.asset.symbol}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${item.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className={cn("text-right", item.change24h >= 0 ? 'text-primary' : 'text-destructive')}>
                    {item.change24h >= 0 ? '+' : ''}{item.change24h.toFixed(2)}%
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                    ${(item.marketCap / 1e9).toFixed(2)}B
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="h-10 w-28 mx-auto">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={item.sparkline.map((v, i) => ({ name: i, value: v }))}>
                           <defs>
                              <linearGradient id={`color-${item.asset.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={item.change24h >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={item.change24h >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                          <Tooltip
                            contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: 'var(--radius)',
                            }}
                            labelStyle={{ display: 'none' }}
                            itemStyle={{ color: 'hsl(var(--foreground))'}}
                          />
                          <Area type="monotone" dataKey="value" stroke={item.change24h >= 0 ? "hsl(var(--primary))" : "hsl(var(--destructive))"} fillOpacity={1} fill={`url(#color-${item.asset.id})`} strokeWidth={2} />
                           <YAxis domain={['dataMin - 10', 'dataMax + 10']} hide />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
