import AppHeader from '@/components/layout/app-header';
import TransactionHistory from '@/components/transactions/transaction-history';

export default function TransactionsPage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Transactions" />
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <TransactionHistory />
        </div>
      </div>
    </div>
  );
}
