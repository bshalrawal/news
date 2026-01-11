
// Inspired by https://usehooks.com/useAuth/
"use client";

import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_EMAILS, teamMembers } from '@/lib/config';
import type { UserProfile } from '@/lib/types';


type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userRef);
        
        const isAdmin = ADMIN_EMAILS.includes(user.email || '');

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          let needsUpdate = false;
          const updates: Partial<UserProfile> = {};

          if (profileData.isAdmin !== isAdmin) {
            updates.isAdmin = isAdmin;
            needsUpdate = true;
          }

          // If the firestore profile doesn't have a username but the auth profile does, update it.
          if (!profileData.username && user.displayName) {
            updates.username = user.displayName;
            needsUpdate = true;
          }

          if (needsUpdate) {
             await setDoc(userRef, updates, { merge: true });
             setUserProfile({ ...profileData, ...updates });
          } else {
             setUserProfile(profileData);
          }
        } else {
          // Create a new user profile in Firestore if it doesn't exist
          const teamMember = teamMembers.find(tm => tm.email === user.email);
          
          // Data to be saved in Firestore, using serverTimestamp
          const profileToSave: Omit<UserProfile, 'createdAt'> & { createdAt: any } = {
            uid: user.uid,
            email: user.email,
            username: user.displayName || teamMember?.name || null,
            isAdmin: isAdmin,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, profileToSave);
          
          // Data to be set in local state, using a client-side Date
          const localProfile: UserProfile = {
              ...profileToSave,
              createdAt: new Date(),
          };
          setUserProfile(localProfile);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
