
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc, writeBatch, query, orderBy, runTransaction } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Category } from '@/lib/types';
import { CategorySchema } from '@/lib/types';
import { z } from 'zod';

export async function addCategory(data: z.infer<typeof CategorySchema>): Promise<{ success: boolean; message: string }> {
    const validatedFields = CategorySchema.safeParse(data);
    if (!validatedFields.success) {
        return { success: false, message: 'अमान्य डाटा।' };
    }
    
    const { name, slug } = validatedFields.data;

    const categoriesCollection = collection(db, 'categories');
    const categoryRef = doc(categoriesCollection, slug);

    try {
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(categoryRef);
            if (docSnap.exists()) {
                throw new Error('यो स्लग पहिले नै अवस्थित छ।');
            }

            const q = query(categoriesCollection);
            const snapshot = await getDocs(q);
            const newOrder = snapshot.size;

            transaction.set(categoryRef, { name, slug, order: newOrder });
        });

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true, message: 'श्रेणी सफलतापूर्वक थपियो।' };
    } catch (error: any) {
        console.error('Error adding category:', error);
        return { success: false, message: error.message || 'डाटाबेस त्रुटि: श्रेणी थप्न असफल भयो।' };
    }
}

export async function getCategories(): Promise<Category[]> {
    try {
        const categoriesCollection = collection(db, 'categories');
        const q = query(categoriesCollection, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const categories = querySnapshot.docs.map(doc => doc.data() as Category);
        
        // Fallback sort for items that might not have an 'order' field yet.
        return categories.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function deleteCategory(slug: string): Promise<{ success: boolean; message: string }> {
    if (!slug) {
        return { success: false, message: 'अमान्य श्रेणी स्लग।' };
    }
    
    const categoryRef = doc(db, 'categories', slug);

    try {
        await deleteDoc(categoryRef);
        // Note: Re-ordering other categories after deletion might be needed
        // but is complex. For now, we'll just delete.
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true, message: 'श्रेणी सफलतापूर्वक मेटाइयो।' };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, message: 'डाटाबेस त्रुटि: श्रेणी मेटाउन असफल भयो।' };
    }
}

export async function updateCategoryOrder(categories: Category[]): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);
    categories.forEach((category) => {
      const categoryRef = doc(db, 'categories', category.slug);
      batch.update(categoryRef, { order: category.order });
    });
    await batch.commit();
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true, message: 'श्रेणीको क्रम सफलतापूर्वक अद्यावधिक भयो।' };
  } catch (error) {
    console.error('Error updating category order:', error);
    return { success: false, message: 'डाटाबेस त्रुटि: श्रेणीको क्रम अद्यावधिक गर्न असफल भयो।' };
  }
}
