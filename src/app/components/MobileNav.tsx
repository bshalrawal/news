
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/Logo';
import { UserProfile } from './UserProfile';
import type { Category } from '@/lib/types';

export function MobileNav({ categories }: { categories: Category[] }) {
    const [open, setOpen] = useState(false);

    const navItems = [
        { href: '/', label: 'गृहपृष्ठ' },
        ...categories.map(category => ({
            href: `/category/${category.slug}`,
            label: category.name
        }))
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-white hover:text-white/80 hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <div className="flex flex-col gap-6 py-6">
                    <Link href="/" className="mb-4">
                        <Logo isMobile={true} />
                    </Link>
                    <nav className="flex flex-col gap-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="text-lg font-semibold text-foreground hover:text-primary capitalize"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="font-semibold">My Account</h3>
                        <UserProfile mode="full" />
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
