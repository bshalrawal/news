

import { collection, getDocs, orderBy, query as firestoreQuery, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { PostCard } from '@/app/components/PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/app/components/Footer';
import { notFound } from 'next/navigation';
import { getCategories } from '@/lib/categories.actions';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatToNepaliDate } from '@/lib/nepali-date-utils';
import { getPostUrl } from '@/lib/utils';

// Helper to convert Firestore Timestamps in nested objects to serializable format
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


async function getPostsByCategory(categoryName: string): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const q = firestoreQuery(
      reviewsCollection,
      where('status', '==', 'published'),
      where('category', '==', categoryName),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }) as Post);
  } catch (error) {
    console.error(`Error fetching posts for category ${categoryName}:`, error);
    return [];
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // URL slugs can be encoded, so we decode it to get the original slug.
  const decodedSlug = decodeURIComponent(slug);

  const categories = await getCategories();
  const currentCategory = categories.find(cat => cat.slug === decodedSlug);

  if (!currentCategory) {
    notFound();
  }

  const categoryName = currentCategory.name;
  const allPosts = await getPostsByCategory(categoryName);

  const featuredPost = allPosts.length > 0 ? allPosts[0] : null;
  const latestUpdates = allPosts.length > 1 ? allPosts.slice(1, 5) : [];
  const remainingPosts = allPosts.length > 5 ? allPosts.slice(5) : [];

  return (
    <>
      <main className="flex-1">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline capitalize">{categoryName}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{categoryName} श्रेणीमा नवीनतम पोस्टहरू ब्राउज गर्नुहोस्।</p>
        </div>

        {allPosts.length > 0 && featuredPost ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Main Featured Story (Left 2/3) */}
            <div className="lg:col-span-2">
              <Link href={getPostUrl(featuredPost)} className="group block relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {featuredPost.imageUrl ? (
                  <img
                    src={featuredPost.imageUrl}
                    alt={featuredPost.imageAlt || featuredPost.name}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center text-4xl text-muted-foreground font-bold">Image</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-10 text-white w-full">
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold font-mukta leading-tight mb-3 group-hover:text-gray-100 transition-colors drop-shadow-lg">
                    {featuredPost.name}
                  </h1>
                  <div className="flex items-center text-gray-300 text-base font-mukta gap-4">
                    <span>{formatToNepaliDate(featuredPost.createdAt as any)}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right Sidebar (1/3) */}
            <div className="flex flex-col gap-8">
              <div className="bg-white rounded-2xl border border-muted/30 p-6 shadow-sm flex-1">
                <h3 className="text-xl font-bold mb-6 font-mukta flex items-center text-foreground">
                  <span className="w-1.5 h-6 bg-primary mr-4 rounded-full"></span>
                  ताजा अपडेट
                </h3>
                {latestUpdates.length > 0 ? (
                  <div className="space-y-6">
                    {latestUpdates.map((post) => (
                      <Link key={post.id} href={getPostUrl(post)} className="block group">
                        <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug font-mukta mb-2">
                          {post.name}
                        </h4>
                        <div className="text-muted-foreground text-sm font-mukta">
                          {formatToNepaliDate(post.createdAt as any)}
                        </div>
                        <div className="mt-4 border-b border-muted/50 last:border-0"></div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">यस श्रेणीमा थप अपडेटहरू छैनन्।</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>&quot;{categoryName}&quot; श्रेणीमा अहिलेसम्म कुनै पोस्ट भेटिएन। चाँडै फेरि जाँच गर्नुहोस्!</p>
            </CardContent>
          </Card>
        )}

        {/* Remaining Posts Grid */}
        {remainingPosts.length > 0 && (
          <div className="border-t pt-12">
            <h3 className="text-2xl font-bold mb-8 font-mukta flex items-center">
              <span className="w-2 h-8 bg-primary mr-4 rounded-sm"></span>
              थप समाचार
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {remainingPosts.map((post) => (
                <PostCard key={post.id} review={post} />
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
