'use client';

import { useEffect } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/firebase-types';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * This component ensures that a user is always authenticated.
 * If no user is logged in, it initiates an anonymous sign-in process.
 * It also ensures a user profile document exists in Firestore for the signed-in user.
 */
export default function EnsureAuth() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    if (auth && !isUserLoading && !user) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  useEffect(() => {
    if (user && firestore) {
        // When a user (anonymous or otherwise) signs in, check if their profile exists.
        // If not, create one. This is an idempotent operation.
        const userProfileRef = doc(firestore, 'users', user.uid);
        
        const userProfileData: Partial<UserProfile> = {
            id: user.uid,
            email: user.email || `${user.uid}@anon.zenith.com`,
            createdAt: user.metadata.creationTime || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // This will create the document if it doesn't exist, or merge the fields if it does.
        setDocumentNonBlocking(userProfileRef, userProfileData, { merge: true });
    }
  }, [user, firestore]);

  return null; // This component does not render anything.
}
