
'use server';

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

export async function addCategory(name: string): Promise<{ success: boolean; message: string }> {
    const slug = generateSlug(name);
    if (!name || !slug) {
        return { success: false, message: 'श्रेणीको नाम आवश्यक छ।' };
    }

    const categoryRef = doc(db, 'categories', slug);

    try {
        const docSnap = await getDoc(categoryRef);
        if (docSnap.exists()) {
            return { success: false, message: 'श्रेणी पहिले नै अवस्थित छ।' };
        }

        await setDoc(categoryRef, { name: name, slug: slug });

        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true, message: 'श्रेणी सफलतापूर्वक थपियो।' };
    } catch (error) {
        console.error('Error adding category:', error);
        return { success: false, message: 'डाटाबेस त्रुटि: श्रेणी थप्न असफल भयो।' };
    }
}

export async function getCategories(): Promise<string[]> {
    try {
        const categoriesCollection = collection(db, 'categories');
        const querySnapshot = await getDocs(categoriesCollection);
        const categories = querySnapshot.docs.map(doc => doc.data().name as string);
        return categories.sort();
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
}

export async function deleteCategory(name: string): Promise<{ success: boolean; message: string }> {
     const slug = generateSlug(name);
    if (!slug) {
        return { success: false, message: 'अमान्य श्रेणी नाम।' };
    }
    
    const categoryRef = doc(db, 'categories', slug);

    try {
        await deleteDoc(categoryRef);
        revalidatePath('/admin/categories');
        revalidatePath('/');
        return { success: true, message: 'श्रेणी सफलतापूर्वक मेटाइयो।' };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, message: 'डाटाबेस त्रुटि: श्रेणी मेटाउन असफल भयो।' };
    }
}
