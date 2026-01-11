
import { MetadataRoute } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post, Category } from '@/lib/types';

async function getCategories(): Promise<Category[]> {
  try {
    const categoriesCollection = collection(db, 'categories');
    const querySnapshot = await getDocs(categoriesCollection);
    return querySnapshot.docs.map(doc => doc.data() as Category);
  } catch (error) {
    console.error("Error fetching categories for sitemap:", error);
    return [];
  }
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = 'https://bidhinews.com';

  // Get all published posts
  const reviewsCollection = collection(db, 'reviews');
  const q = query(reviewsCollection, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));

  const postEntries: MetadataRoute.Sitemap = posts.map(({ id, updatedAt }) => ({
    url: `${siteUrl}/news/${id}`,
    lastModified: updatedAt ? new Date(updatedAt.seconds * 1000) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // Get all categories
  const categories = await getCategories();
  const categoryEntries: MetadataRoute.Sitemap = categories.map(({ slug }) => ({
    url: `${siteUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.1,
    },
  ];

  return [...staticRoutes, ...postEntries, ...categoryEntries];
}
