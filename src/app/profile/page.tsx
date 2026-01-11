
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { Footer } from '@/app/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { getInitials } from '@/lib/utils';


export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ description: 'तपाईं सफलतापूर्वक लग आउट हुनुभयो।' });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'लगआउट असफल',
        description: 'लगआउटको क्रममा त्रुटि भयो।',
      });
    }
  };
  
  if (loading || !user) {
    // This can be a more dedicated loading skeleton for a profile page
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  const displayName = userProfile?.username || user.displayName || user.email;

  return (
    <>
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.photoURL ?? ''} alt={displayName ?? 'User'} />
              <AvatarFallback className="text-3xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold font-headline">
              {displayName || 'स्वागत छ!'}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              यो तपाईंको प्रोफाइल पृष्ठ हो। थप सुविधाहरू चाँडै आउँदैछन्!
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              लगआउट
            </Button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </>
  );
}
