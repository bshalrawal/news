
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { PostForm } from '../../components/ReviewForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { notFound } from 'next/navigation';

async function getReview(id: string): Promise<Post | null> {
  const docRef = doc(db, 'reviews', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    // Convert Firestore Timestamps to serializable strings
    const plainObject = JSON.parse(JSON.stringify({ id: docSnap.id, ...data }));
    return plainObject as Post;
  } else {
    return null;
  }
}

export default async function EditReviewPage({ params }: { params: { id: string } }) {
  const post = await getReview(params.id);

  if (!post) {
    notFound();
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">पोस्ट सम्पादन गर्नुहोस्</CardTitle>
            <CardDescription>&quot;{post.name}&quot; को लागि विवरणहरू अद्यावधिक गर्नुहोस्।</CardDescription>
        </CardHeader>
        <CardContent>
            <PostForm post={post} />
        </CardContent>
    </Card>
  );
}
