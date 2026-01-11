
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query as firestoreQuery, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { PostCard } from '@/app/components/PostCard';
import { CardSkeleton } from '@/app/components/CardSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Footer } from '@/app/components/Footer';

async function searchAllPosts(searchTerm: string): Promise<Post[]> {
  if (!searchTerm) return [];
  try {
    const reviewsCollection = collection(db, 'reviews');
    // A simple text search in Firestore is limited.
    // For a more robust search, you would typically use a dedicated search service like Algolia or Elasticsearch.
    // This implementation will filter posts where the name contains the search term.
    // A more advanced approach would be to create a 'keywords' array in your documents.
    const q = firestoreQuery(reviewsCollection, where('status', '==', 'published'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

    const term = searchTerm.toLowerCase();
    return allPosts.filter(post =>
      post.name.toLowerCase().includes(term) ||
      post.description.toLowerCase().includes(term) ||
      (Array.isArray(post.keywords)
        ? post.keywords.some(k => k.toLowerCase().includes(term))
        : typeof post.keywords === 'string' && post.keywords.toLowerCase().includes(term)) ||
      (post.category && post.category.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("Error searching posts: ", error);
    return [];
  }
}


function SearchResults() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q') || '';
  const [results, setResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const performSearch = async () => {
      if (searchTerm) {
        setLoading(true);
        const searchResults = await searchAllPosts(searchTerm);
        setResults(searchResults);
        setLoading(false);
      } else {
        setResults([]);
        setLoading(false);
      }
    };
    performSearch();
  }, [searchTerm]);

  return (
    <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-2 font-headline">
        खोज परिणामहरू
      </h1>
      {searchTerm && (
        <p className="text-center text-muted-foreground mb-12">
            &quot;{searchTerm}&quot; को लागि परिणामहरू देखाउँदै
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((review) => (
            <PostCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>तपाईंको &quot;{searchTerm}&quot; को खोजले कुनै पनि पोस्टसँग मेल खाएन। फरक शब्द प्रयास गर्नुहोस्।</p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

export default function SearchPage() {
    return (
        <>
            <main className="flex-1">
                <Suspense fallback={<div>लोड हुँदै...</div>}>
                    <SearchResults />
                </Suspense>
            </main>
            <Footer />
        </>
    )
}
