import AppHeader from '@/components/layout/app-header';
import SampleCard from '@/components/wallet/sample-card';

export default function SampleCardPage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Sample Credit Card" />
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md">
           <SampleCard />
        </div>
      </div>
    </div>
  );
}
