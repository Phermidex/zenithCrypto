import AppHeader from '@/components/layout/app-header';
import ProfileForm from '@/components/profile/profile-form';

export default function ProfilePage() {
  return (
    <div className="flex flex-col h-full">
      <AppHeader title="Profile" />
      <div className="flex-1 p-8 flex items-center justify-center overflow-y-auto">
        <div className="w-full max-w-md">
           <ProfileForm />
        </div>
      </div>
    </div>
  );
}
