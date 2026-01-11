

import { collection, doc, getDoc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Footer } from '@/app/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import type { Metadata, ResolvingMetadata } from 'next';
import { Timestamp } from 'firebase/firestore';
import { TrendingPosts } from './TrendingPosts';
import { formatToNepaliDate } from '@/lib/nepali-date-utils';

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


async function getReview(id: string): Promise<Post | null> {
  const docRef = doc(db, 'reviews', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const reviewData = {
      id: docSnap.id,
      ...data,
    };
    // Convert all Timestamps to serializable format
    return convertTimestamps(reviewData) as Post;
  } else {
    return null;
  }
}

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id
  const review = await getReview(id);

  if (!review) {
    return {
      title: 'Post Not Found',
    }
  }

  // Strip HTML for a clean description
  const description = review.description.replace(/<[^>]+>/g, '').substring(0, 160);
  const siteUrl = 'https://bidhinews.com';
  const ogImageUrl = review.imageUrl && review.imageUrl.startsWith('http') ? review.imageUrl : `${siteUrl}/api/og?title=${encodeURIComponent(review.name)}`;


  return {
    title: review.name,
    description: description,
    alternates: {
      canonical: `${siteUrl}/news/${review.id}`,
    },
    openGraph: {
      title: review.name,
      description: description,
      url: `${siteUrl}/news/${review.id}`,
      type: 'article',
      publishedTime: review.createdAt ? new Date(review.createdAt as any).toISOString() : undefined,
      modifiedTime: review.updatedAt ? new Date(review.updatedAt as any).toISOString() : undefined,
      images: ogImageUrl ? [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: review.imageAlt || review.name,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: review.name,
      description: description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
  }
}


export default async function NewsDetailPage({ params }: { params: { id: string } }) {
  const review = await getReview(params.id);

  if (!review) {
    notFound();
  }

  return (
    <>
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            <article className="space-y-8">
              {/* Header Section */}
              <div className="space-y-6 text-center">
                {review.category && (
                  <Badge className="bg-primary hover:bg-primary/90 text-white px-4 py-1 text-base font-medium rounded-full mb-4 font-mukta">
                    {review.category}
                  </Badge>
                )}
                <h1 className="font-mukta text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-foreground">
                  {review.name}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground font-mukta text-base md:text-lg">
                  {review.author && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{review.author}</span>
                    </div>
                  )}
                  <span className="hidden sm:inline w-1.5 h-1.5 bg-muted-foreground/40 rounded-full"></span>
                  <span>{formatToNepaliDate(review.createdAt as any)}</span>
                </div>
              </div>

              {/* Featured Image */}
              {review.imageUrl && (
                <div className="relative w-full aspect-video md:aspect-[2/1] overflow-hidden rounded-xl shadow-lg border border-muted/20">
                  <img
                    src={review.imageUrl}
                    alt={review.imageAlt || `A photo of ${review.name}`}
                    className="w-full h-full object-cover"
                    data-ai-hint="kathmandu nepal"
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="prose prose-lg dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-mukta mx-auto">
                <div dangerouslySetInnerHTML={{ __html: review.description }} />
              </div>

              {/* Tags */}
              {review.keywords && review.keywords.length > 0 && (
                <div className="pt-8 border-t">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-semibold font-mukta text-muted-foreground">ट्यागहरू:</span>
                    {(Array.isArray(review.keywords) ? review.keywords : (review.keywords as string).split(',')).map((keyword: string) => (
                      <Badge key={keyword} variant="secondary" className="capitalize hover:bg-secondary/80 cursor-pointer font-mukta font-normal">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </article>

          </div>

          {/* Trending Grid at Bottom */}
          <div className="mt-16">
            <TrendingPosts currentPostId={review.id} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
