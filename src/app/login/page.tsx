
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LoginForm } from './components/LoginForm';

function LoginFormSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
    )
}

export default function LoginPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">पुनः स्वागत छ</CardTitle>
                <CardDescription>आफ्नो खाता पहुँच गर्न आफ्नो प्रमाणहरू प्रविष्ट गर्नुहोस्।</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isMounted ? <LoginForm /> : <LoginFormSkeleton />}
            </CardContent>
        </Card>
    </div>
  );
}
