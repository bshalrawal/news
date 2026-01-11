

import { collection, getDocs, limit, orderBy, query, where, documentId } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

async function getTrendingPosts(currentPostId: string): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    // Fetch the 5 hottest published posts, excluding the current one.
    const q = query(
      reviewsCollection,
      where('status', '==', 'published'),
      where('isHot', '==', true),
      orderBy('createdAt', 'desc'),
      limit(6) // Fetch 6 in case the current post is one of them
    );
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    // Filter out the current post in code, and then take the first 4.
    return posts.filter(post => post.id !== currentPostId).slice(0, 4);
  } catch (error) {
    console.error("Error fetching trending posts:", error);
    return [];
  }
}

function TrendingPostSkeleton() {
  return (
    <div className="flex gap-4">
      <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-6 w-full" />
      </div>
    </div>
  )
}

export async function TrendingPosts({ currentPostId }: { currentPostId: string }) {
  const posts = await getTrendingPosts(currentPostId);


  return (
    <div className="space-y-8 border-t pt-12">
      <h2 className="flex items-center gap-3 font-mukta text-3xl font-bold">
        <span className="w-2 h-8 bg-primary rounded-sm"></span>
        ट्रेन्डिङ
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {posts.length > 0 ? (
          posts.map(post => (
            <Link key={post.id} href={`/news/${post.id}`} className="group block h-full">
              <div className="overflow-hidden rounded-xl border border-muted/50 shadow-sm transition-all hover:shadow-md">
                {post.imageUrl && (
                    <div className="relative aspect-video">
                    <img
                        src={post.imageUrl}
                        alt={post.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    </div>
                )}
                <div className="p-4">
                  <Badge variant="secondary" className="capitalize w-fit mb-2 font-mukta">{post.category || 'समाचार'}</Badge>
                  <h3 className="font-bold font-mukta leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {post.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-sm text-muted-foreground col-span-full text-center py-8">देखाउनको लागि अन्य कुनै पोष्टहरू छैनन्।</div>
        )}
      </div>
    </div>
  );

}
