
'use client';

import type { Post } from '@/lib/types';
import { PostCard } from '@/app/components/PostCard';
import { CardSkeleton } from '@/app/components/CardSkeleton';
import { Card } from '@/components/ui/card';

interface PostsListProps {
  title: string;
  posts: Post[];
  loading: boolean;
  icon: React.ElementType;
}

export function PostsList({
  title,
  posts,
  loading,
  icon: Icon
}: PostsListProps) {

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-headline flex items-center gap-3 capitalize">
            <Icon className="h-8 w-8 text-primary" />
            <span>{title}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }
  
  if (posts.length === 0) {
    return null; // Don't render anything if there are no posts for a category
  }

  return (
    <section>
      <h2 className="text-3xl font-bold font-headline flex items-center gap-3 mb-8 capitalize">
        <Icon className="h-8 w-8 text-primary" />
        <span>{title}</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
              <PostCard key={post.id} review={post} />
          ))}
      </div>
    </section>
  );
}
