import AppHeader from '@/components/layout/app-header';
import CardManagement from '@/components/wallet/card-management';

export default function PaymentPage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Payment Methods" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
            <CardManagement />
        </div>
      </div>
    </div>
  );
}
