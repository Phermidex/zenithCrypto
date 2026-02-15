import AppHeader from '@/components/layout/app-header';
import SendCryptoForm from '@/components/send/send-crypto-form';

export default function SendCryptoPage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Send Crypto" />
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md">
           <SendCryptoForm />
        </div>
      </div>
    </div>
  );
}

    