
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ADMIN_EMAILS, WRITER_EMAILS } from '@/lib/config';
import AdminHeader from './components/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const userEmail = user?.email ?? '';
      const isAuthorized = ADMIN_EMAILS.includes(userEmail) || WRITER_EMAILS.includes(userEmail);

      if (!user || !isAuthorized) {
        // If not loading, and user is not logged in OR is not an admin/writer,
        // redirect to the login page.
        router.push('/login');
      }
    }
  }, [user, loading, router]);
  
  const userEmail = user?.email ?? '';
  const isAuthorized = ADMIN_EMAILS.includes(userEmail) || WRITER_EMAILS.includes(userEmail);

  // While loading or if user is not authorized yet, show a loading state
  if (loading || !user || !isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is an admin or writer, render the admin layout
  return (
    <div className="min-h-screen bg-secondary/30">
        <AdminHeader />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
        </main>
    </div>
  );
}
