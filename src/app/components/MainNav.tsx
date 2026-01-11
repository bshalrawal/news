
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

function NavLink({ href, label }: { href: string; label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
    return (
        <NavigationMenuItem>
            <Link href={href} passHref legacyBehavior>
                <NavigationMenuLink
                    active={isActive} 
                    className={cn(
                        navigationMenuTriggerStyle(),
                        "font-mukta font-bold text-lg tracking-wide bg-transparent",
                        isActive ? "text-white underline decoration-2 underline-offset-4" : "text-white"
                    )}
                >
                    {label}
                </NavigationMenuLink>
            </Link>
        </NavigationMenuItem>
    )
}

export function MainNav({ categories }: { categories: Category[] }) {
    
    const navItems = [
        { href: '/', label: 'गृहपृष्ठ' },
        ...categories.map(category => ({
            href: `/category/${category.slug}`,
            label: category.name
        }))
    ];

    return (
         <NavigationMenu>
            <NavigationMenuList>
                {navItems.map((item) => (
                    <NavLink key={item.href} href={item.href} label={item.label} />
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
