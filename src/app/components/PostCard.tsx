
'use client';

import { cn, getPostUrl } from '@/lib/utils';
import type { Post } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';

interface PostCardProps {
    review: Post;
    onBookmarkToggle?: (postId: string) => void;
}

export function PostCard({ review }: PostCardProps) {

    return (
        <Link href={getPostUrl(review)} className="block h-full group">
            <Card className="w-full h-full flex flex-col overflow-hidden border border-muted/50 shadow-sm transition-all duration-300 hover:shadow-lg group-hover:border-primary/20">
                {review.imageUrl ? (
                    <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                            src={review.imageUrl}
                            alt={review.imageAlt || `Image of ${review.name}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            data-ai-hint="kathmandu nepal"
                        />
                        {review.isHot && (
                            <Badge className="absolute top-2 left-2 bg-red-600 hover:bg-red-700 border-none text-white text-[10px] font-bold rounded-md font-mukta">
                                ट्रेन्डिङ
                            </Badge>
                        )}
                    </div>
                ) : (
                    review.isHot && (
                        <div className="px-4 pt-4">
                            <Badge className="bg-red-600 hover:bg-red-700 border-none text-white text-[10px] font-bold rounded-md font-mukta">
                                ट्रेन्डिङ
                            </Badge>
                        </div>
                    )
                )}
                <CardHeader className="p-4 flex-grow">
                    <CardTitle className="font-bold font-mukta text-lg leading-snug line-clamp-3 group-hover:text-primary transition-colors">{review.name}</CardTitle>
                </CardHeader>
                {review.author && (
                    <CardFooter className="mt-auto pt-2 pb-4 flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-medium">{review.author}</span>
                    </CardFooter>
                )}
            </Card>
        </Link>
    );
}
