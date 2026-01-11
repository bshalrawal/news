
'use server'

import { z } from 'zod'
import { db } from '@/lib/firebase'
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, getDoc, arrayUnion, arrayRemove, FieldValue, setDoc, runTransaction, getDocs, query, where, orderBy } from 'firebase/firestore'
import { revalidatePath } from 'next/cache'
import { type Post, FormSchema } from './types'

const PublishSchema = z.object({
    id: z.string(),
    publisherId: z.string(),
    publisherEmail: z.string().email(),
});

export type State = {
  message?: string | null;
  success: boolean;
}

// Update the function signature to accept a plain object
export async function saveReview(rawData: z.infer<typeof FormSchema>, authorId: string, authorEmail: string): Promise<State> {
  const validatedFields = FormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error("Server-side validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      message: validatedFields.error.flatten().fieldErrors ? 
        Object.values(validatedFields.error.flatten().fieldErrors).flat().join(', ') :
       'अपूर्ण वा अमान्य फिल्डहरू। पोस्ट बचत गर्न असफल भयो।',
      success: false,
    }
  }
  
  let { id, ...data } = validatedFields.data
  
  try {
    const reviewData: { [key: string]: any } = {
      ...data,
      authorId,
      authorEmail,
      updatedAt: serverTimestamp(),
      keywords: data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
    };

    if (id) {
      const reviewDoc = doc(db, 'reviews', id)
      await updateDoc(reviewDoc, reviewData)
    } else {
      // Initialize fields that only exist on new documents
      reviewData.createdAt = serverTimestamp();
      reviewData.comments = [];
      reviewData.bookmarkedBy = [];
      reviewData.createdBy = {
        uid: authorId,
        email: authorEmail,
        at: serverTimestamp(),
      }
      await addDoc(collection(db, 'reviews'), reviewData)
    }
  } catch (error) {
    console.error("Database Error:", error);
    return { message: 'डाटाबेस त्रुटि: पोस्ट बचत गर्न असफल भयो।', success: false }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/bookmarks');
  if (id) {
    revalidatePath(`/news/${id}`);
  }
  
  const successMessage = id ? 'पोस्ट सफलतापूर्वक अद्यावधिक भयो!' : 'पोस्ट सफलतापूर्वक बचत भयो!';
  return { message: successMessage, success: true };
}


export async function deleteReview(id: string) {
  try {
    await deleteDoc(doc(db, "reviews", id));
    revalidatePath('/admin');
    revalidatePath('/');
    return { message: 'पोस्ट मेटाइयो।' };
  } catch (e) {
    return { message: 'डाटाबेस त्रुटि: पोस्ट मेटाउन असफल भयो।' };
  }
}

export async function publishReview(formData: FormData) {
    const rawData = {
        id: formData.get('id'),
        publisherId: formData.get('publisherId'),
        publisherEmail: formData.get('publisherEmail'),
    };
    
    const validatedFields = PublishSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return { success: false, message: 'अमान्य डाटा प्रदान गरियो।' };
    }

    const { id, publisherId, publisherEmail } = validatedFields.data;

    try {
        const reviewRef = doc(db, "reviews", id);
        await updateDoc(reviewRef, { 
            status: 'published', 
            updatedAt: serverTimestamp(),
            publishedBy: {
                uid: publisherId,
                email: publisherEmail,
                at: serverTimestamp()
            }
        });
        
        revalidatePath('/admin');
        revalidatePath('/');
        revalidatePath(`/news/${id}`);
        return { success: true, message: 'पोस्ट सफलतापूर्वक प्रकाशित भयो।' };
    } catch (e) {
        console.error("Publish Error:", e);
        return { success: false, message: 'डाटाबेस त्रुटि: पोस्ट प्रकाशित गर्न असफल भयो।' };
    }
}
