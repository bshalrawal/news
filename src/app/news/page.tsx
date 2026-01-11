
import { collection, getDocs, orderBy, query as firestoreQuery, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { PostCard } from '@/app/components/PostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/app/components/Footer';
import { CardSkeleton } from '@/app/components/CardSkeleton';

async function getReviews(): Promise<Post[]> {
  try {
    const reviewsCollection = collection(db, 'reviews');
    const q = firestoreQuery(
      reviewsCollection,
      where('status', '==', 'published'),
      where('postType', '==', 'news'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

export default async function NewsPage() {
  const reviews = await getReviews();

  return (
    <>
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline">सबै समाचारहरू</h1>
          <p className="text-muted-foreground mt-2 text-lg">सबै लेखहरू मार्फत ब्राउज गर्नुहोस्।</p>
        </div>
        
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <PostCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <p>अहिलेसम्म कुनै लेख थपिएको छैन। चाँडै फेरि जाँच गर्नुहोस्!</p>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </>
  );
}
