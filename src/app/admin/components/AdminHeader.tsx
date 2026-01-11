
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { LogOut, PlusCircle, Home, LayoutList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/Logo';

export default function AdminHeader() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ description: "तपाईं लग आउट हुनुभयो।" });
      router.push('/login');
    } catch (error) {
      toast({ variant: "destructive", title: "लगआउट असफल भयो", description: "लगआउटको क्रममा त्रुटि भयो।" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/admin" className="items-center gap-3 mr-auto flex">
            <Logo isMobile={true} />
            <span className="font-bold text-lg hidden sm:inline">व्यवस्थापक प्यानल</span>
        </Link>
        <nav className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <Home className="mr-0 h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">साइट हेर्नुहोस्</span>
            </Link>
          </Button>
           <Button asChild variant="outline" size="sm">
            <Link href="/admin/categories">
              <LayoutList className="mr-0 h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">श्रेणीहरू</span>
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/new">
              <PlusCircle className="mr-0 h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">नयाँ लेख</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-0 h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">लगआउट</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
