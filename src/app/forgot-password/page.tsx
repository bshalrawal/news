
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitted(false);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "पासवर्ड रिसेट इमेल पठाइयो",
        description: `यदि ${email} को लागि खाता अवस्थित छ भने, तपाईंले आफ्नो पासवर्ड रिसेट गर्न निर्देशनहरू सहितको इमेल प्राप्त गर्नुहुनेछ।`,
      });
      setIsSubmitted(true);
    } catch (error: any) {
      console.error(error);
      // We show a generic message to prevent email enumeration
      toast({
        title: "पासवर्ड रिसेट इमेल पठाइयो",
        description: `यदि ${email} को लागि खाता अवस्थित छ भने, तपाईंले आफ्नो पासवर्ड रिसेट गर्न निर्देशनहरू सहितको इमेल प्राप्त गर्नुहुनेछ।`,
      });
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">आफ्नो पासवर्ड बिर्सनुभयो?</CardTitle>
                <CardDescription>
                    कुनै समस्या छैन। तल आफ्नो इमेल प्रविष्ट गर्नुहोस् र हामी तपाईंलाई यसलाई रिसेट गर्न लिङ्क पठाउनेछौं।
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isSubmitted ? (
                    <div className="text-center text-sm text-muted-foreground p-4 bg-secondary rounded-md">
                        <p>कृपया पासवर्ड रिसेट लिङ्कको लागि आफ्नो इनबक्स (र स्प्याम फोल्डर) जाँच गर्नुहोस्।</p>
                    </div>
                ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-4">
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "पठाउँदै..." : <><Mail className="mr-2 h-4 w-4" /> रिसेट लिङ्क पठाउनुहोस्</>}
                        </Button>
                    </form>
                )}
            </CardContent>
            <CardFooter>
                 <Button asChild variant="link" className="w-full">
                    <Link href="/login">
                        लगइनमा फर्कनुहोस्
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
