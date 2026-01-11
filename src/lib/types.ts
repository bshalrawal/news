

import type { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export interface Category {
  name: string;
  slug: string;
  order: number;
}

export const postTypes = ["news"] as const;
export type PostType = (typeof postTypes)[number];

export type PostStatus = 'draft' | 'published';

export interface AuditInfo {
  uid: string;
  email: string;
  at: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  username: string | null;
  isAdmin: boolean;
  isWriter: boolean;
  createdAt: any;
}


export interface Post {
  id: string;
  name: string; // Title for all types
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
  category: string | null;
  categorySlug?: string | null;
  postNo?: number;
  postSlug?: string;
  keywords: string[];
  postType: PostType;
  author: string | null;
  isHot: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: PostStatus;

  // Audit fields
  authorId: string; // UID of the logged-in user who last saved the post
  authorEmail: string; // Email of the logged-in user who last saved the post
  createdBy?: AuditInfo;
  publishedBy?: AuditInfo;
}

export const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Title is required.'),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  category: z.string().nullable(),
  categorySlug: z.string().optional().nullable(),
  postNo: z.number().optional(),
  postSlug: z.string().optional(),
  keywords: z.string().optional(),
  postType: z.enum(postTypes).default('news'),
  author: z.string().optional().nullable(),
  isHot: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  status: z.enum(['draft', 'published']),
});

// New schema for categories
export const CategorySchema = z.object({
  name: z.string().min(2, 'Category name is required.'),
  slug: z.string().min(2, 'Slug is required.').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format.'),
});
