
'use client';

import type { Post } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useState, useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ReviewCardProps {
  review: Post;
  onBookmarkToggle?: (postId: string) => void;
}

export function ReviewCard({ review, onBookmarkToggle }: ReviewCardProps) {
  
  return (
    <Link href={`/reviews/${review.id}`} className="block h-full group">
        <Card className="w-full h-full flex flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative">
                <img
                    src={review.imageUrl || 'https://placehold.co/600x400.png'}
                    alt={review.imageAlt || `Image of ${review.name}`}
                    className="w-full h-40 md:h-48 object-cover"
                    data-ai-hint="kathmandu nepal"
                />
            </div>
            <CardHeader>
                <CardTitle className="font-bold text-lg mt-1 truncate">{review.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                <CardDescription className="line-clamp-2" dangerouslySetInnerHTML={{ __html: review.description.replace(/<[^>]+>/g, '') }} />
            </CardContent>
             <CardFooter className="mt-auto pt-4 pb-4 flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{review.postType === 'news' ? 'समाचार' : review.postType}</Badge>
                {review.category && <Badge variant="outline" className="capitalize">{review.category}</Badge>}
            </CardFooter>
        </Card>
    </Link>
  );
}
