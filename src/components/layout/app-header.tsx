'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/firebase-types';

export default function AppHeader({ title }: { title: string }) {
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileQuery = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileQuery);

  const getInitials = () => {
    if (isProfileLoading || !user) return '..';
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (userProfile?.firstName) {
      return `${userProfile.firstName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="flex h-20 shrink-0 items-center justify-between border-b border-border/20 px-4 md:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl md:text-2xl font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5 text-muted-foreground" />
        </Button>
        <Avatar>
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
