
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { ADMIN_EMAILS, WRITER_EMAILS } from '@/lib/config';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from '@/components/ui/skeleton';

interface UserProfileProps {
    mode?: 'full' | 'icon';
}

export function UserProfile({ mode = 'full' }: UserProfileProps) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();


    const handleLogout = async () => {
      try {
        await signOut(auth);
        toast({ description: "तपाईं लग आउट हुनुभयो।" });
        router.push('/');
      } catch (error) {
        toast({ variant: "destructive", title: "लगआउट असफल भयो", description: "लगआउटको क्रममा त्रुटि भयो।" });
      }
    };
    
    if (loading) {
        if (mode === 'icon') {
            return <Skeleton className="h-8 w-8 rounded-full" />;
        }
        return null;
    }
    
    if (!user) {
        return null;
    }

    const userEmail = user.email ?? '';
    const isAuthorized = ADMIN_EMAILS.includes(userEmail) || WRITER_EMAILS.includes(userEmail);

    const triggerButton = (
        <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
                <AvatarFallback>{getInitials(userProfile?.username || user.displayName || user.email)}</AvatarFallback>
            </Avatar>
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {triggerButton}
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end" className="w-56">
                <DropdownMenuLabel>मेरो खाता</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile"><Settings className="mr-2 h-4 w-4" />प्रोफाइल</Link>
                </DropdownMenuItem>
                {isAuthorized && (
                <DropdownMenuItem asChild>
                    <Link href="/admin"><Settings className="mr-2 h-4 w-4" />व्यवस्थापक प्यानल</Link>
                </DropdownMenuItem>
                )}
                 {isAuthorized && (
                    <DropdownMenuItem asChild>
                        <Link href="/admin/new"><PlusCircle className="mr-2 h-4 w-4" />लेख थप्नुहोस्</Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" /> लगआउट
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
