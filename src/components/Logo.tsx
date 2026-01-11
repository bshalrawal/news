
import React from 'react';
import { cn } from '@/lib/utils';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
});

interface LogoProps {
  isMobile?: boolean;
}

export function Logo({ isMobile = false }: LogoProps) {
  if (isMobile) {
    return (
      <div className="flex items-center gap-3">
        <img
          src="/bm.jpg"
          alt="Bidhi News Logo"
          className="h-10 w-auto rounded-sm object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src="/bm.jpg"
        alt="Bidhi News Logo"
        className="h-20 lg:h-24 w-auto object-contain"
      />
     
    </div>
  );
}
