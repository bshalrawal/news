

import { Suspense } from 'react';
import { collection, getDocs, limit, orderBy, query as firestoreQuery, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { HomePageContent } from '@/app/components/HomePageContent';
import { Skeleton } from '@/components/ui/skeleton';
import { getCategories } from '@/lib/categories.actions';

const convertTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }

  if (data instanceof Timestamp) {
    return data.toDate().toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }

  const newData: { [key: string]: any } = {};
  for (const key in data) {
    newData[key] = convertTimestamps(data[key]);
  }
  return newData;
};


async function getRecentPosts(count: number): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const q = firestoreQuery(
      reviewsCollection,
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as Post);
  } catch (error) {
    console.error(`Error fetching recent posts: `, error);
    return [];
  }
}

async function getTrendingPosts(count: number): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const q = firestoreQuery(
      reviewsCollection,
      where('status', '==', 'published'),
      where('isHot', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as Post);
  } catch (error) {
    console.error(`Error fetching trending posts: `, error);
    return [];
  }
}

async function getFeaturedPostsForCategory(categoryName: string, count: number): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const q = firestoreQuery(
      reviewsCollection,
      where('status', '==', 'published'),
      where('category', '==', categoryName),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as Post);
  } catch (error) {
    console.error(`Error fetching featured posts for category ${categoryName}:`, error);
    return [];
  }
}


function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Skeleton className="w-full h-[450px] rounded-lg" />
      </div>
      <div className="lg:col-span-1">
        <Skeleton className="w-full h-full min-h-[200px] rounded-lg" />
      </div>
    </div>
  );
}

export default async function Home() {
  const [trendingPosts, recentPosts, categories] = await Promise.all([
    getTrendingPosts(10),
    getRecentPosts(30),
    getCategories()
  ]);

  // Use trending posts for hero if they have images
  const trendingWithImage = trendingPosts.filter(p => p.imageUrl);

  // Combine trending and recent posts, ensuring no duplicates and prioritizing trending posts.
  const combinedPosts = [...trendingWithImage, ...recentPosts];
  const uniquePosts = Array.from(new Map(combinedPosts.map(p => [p.id, p])).values());

  // Separate posts based on whether they have an image
  const postsWithImage = uniquePosts.filter(p => p.imageUrl);
  const textOnlyPosts = uniquePosts.filter(p => !p.imageUrl);

  const categoryPostPromises = categories.map(async (category) => {
    const posts = await getFeaturedPostsForCategory(category.name, 4); // Fetch 4 posts for each category section
    return { category: category.name, posts };
  });
  const categoryPosts = (await Promise.all(categoryPostPromises)).filter(cp => cp.posts.length > 0);

  return (
    <Suspense fallback={<HeroSkeleton />}>
      <HomePageContent
        postsWithImage={postsWithImage}
        textOnlyPosts={textOnlyPosts}
        categoryPosts={categoryPosts}
      />
    </Suspense>
  );
}
