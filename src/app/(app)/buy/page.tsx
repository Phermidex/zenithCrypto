import AppHeader from '@/components/layout/app-header';
import BuyCryptoForm from '@/components/buy/buy-crypto-form';

export default function BuyCryptoPage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Buy Crypto" />
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md">
           <BuyCryptoForm />
        </div>
      </div>
    </div>
  );
}
