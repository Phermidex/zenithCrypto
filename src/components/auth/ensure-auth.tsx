'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { redirect, usePathname } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * This component ensures that a user is authenticated before accessing
 * protected routes. It will redirect to the login page if the user is not
 * authenticated. It's meant to be used inside protected layouts.
 */
export default function EnsureAuth() {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      redirect(`/login?redirect=${pathname}`);
    }
  }, [user, isUserLoading, pathname]);

  // While loading, show a skeleton loader to avoid layout shifts.
  if (isUserLoading || !user) {
    return (
        <div className="flex flex-col h-screen w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
  }

  return null; // This component doesn't render anything itself, it just guards
}
