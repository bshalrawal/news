

import Link from 'next/link';
import { Suspense } from 'react';
import { Logo } from '@/components/Logo';
import { UserProfile } from './UserProfile';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { Category } from '@/lib/types';
import { NepaliDateTime } from './NepaliDateTime';
import { MainNav } from './MainNav';
import { MobileNav } from './MobileNav';
import { GlobalSearch } from './GlobalSearch';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function AppShell({ categories, children }: { categories: Category[], children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-background">
                {/* Top Bar */}
                <div className="border-b bg-white text-sm text-muted-foreground">
                    <div className="container mx-auto px-4 h-9 flex items-center justify-between">
                        <div>
                            <NepaliDateTime />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Link href="/contact" className="hover:text-primary transition-colors">सम्पर्क</Link>
                            </div>
                            <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
                                <UserProfile mode="icon" />
                            </Suspense>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="bg-white">
                    <div className="container mx-auto px-4 flex flex-col items-center justify-center">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="sticky top-0 z-40 bg-primary text-white shadow-md">
                    <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                        <div className="md:hidden">
                            <MobileNav categories={categories} />
                        </div>
                        <div className="hidden md:flex flex-1 justify-center">
                            <MainNav categories={categories} />
                        </div>
                        <div className="flex items-center justify-end md:w-auto">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:text-white/80 hover:bg-white/10">
                                        <Search className="h-5 w-5" />
                                        <span className="sr-only">Search</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="top" className="p-4">
                                    <div className="container mx-auto max-w-xl">
                                        <GlobalSearch />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </div>

            </header>
            <main className="flex-1 bg-[#F9F9F9]">
                <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
