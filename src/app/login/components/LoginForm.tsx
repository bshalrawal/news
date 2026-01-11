
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 1.62-4.55 1.62-3.87 0-7-3.13-7-7s3.13-7 7-7c2.04 0 3.7.78 4.98 2.04l2.54-2.54C18.14 1.34 15.47 0 12.48 0 5.88 0 .02 5.88.02 12.48s5.86 12.48 12.46 12.48c3.47 0 6.22-1.17 8.27-3.23 2.1-2.1 2.86-5.2 2.86-7.84 0-.58-.05-1.16-.16-1.72h-11Z"/>
    </svg>
);


export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "लगइन सफल",
        description: "पुनः स्वागत छ!",
      });
      router.push('/profile');
    } catch (error: any) {
      console.error(error);
      let description = "एक अप्रत्याशित त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        description = "अमान्य इमेल वा पासवर्ड। कृपया फेरि प्रयास गर्नुहोस्।";
      }
      toast({
        variant: "destructive",
        title: "लगइन असफल",
        description: description,
      });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setIsLoading(true);
    try {
        await signInWithPopup(auth, googleProvider);
        toast({
            title: "लगइन सफल",
            description: `स्वागत छ! तपाईंले गुगल मार्फत लगइन गर्नुभयो।`,
        });
        router.push('/profile');
    } catch (error: any) {
        console.error("Social Login Error: ", error);
        let description = "एक अप्रत्याशित त्रुटि भयो।";
        if (error.code === 'auth/account-exists-with-different-credential') {
            description = 'एउटै इमेल ठेगाना तर फरक साइन-इन प्रमाणहरूसँग पहिले नै खाता अवस्थित छ।';
        }
        toast({
            variant: "destructive",
            title: "लगइन असफल",
            description: description,
        });
    } finally {
        setIsLoading(false);
    }
  }


  return (
    <>
        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">इमेल</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="me@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                     <Label htmlFor="password">पासवर्ड</Label>
                     <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        पासवर्ड बिर्सनुभयो?
                     </Link>
                </div>
                <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "लगइन गर्दै..." : <><KeyRound className="mr-2 h-4 w-4" /> इमेलमार्फत लगइन गर्नुहोस्</>}
            </Button>
        </form>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                    वा यसबाट जारी राख्नुहोस्
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            <Button variant="outline" onClick={handleSocialLogin} disabled={isLoading}>
                <GoogleIcon className="mr-2 h-4 w-4" />
                Google मार्फत साइन इन गर्नुहोस्
            </Button>
        </div>
    </>
  );
}
