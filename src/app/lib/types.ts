

import type { Timestamp } from "firebase/firestore";
import { z } from 'zod';

export type Category = string;

export const postTypes = ["news"] as const;
export type PostType = (typeof postTypes)[number];

export type PostStatus = 'draft' | 'published';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  text: string;
  createdAt: Date | string; // Allow both for compatibility
  updatedAt?: Date | string;
  parentId?: string | null;
  replies?: Comment[];
}

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
    createdAt: any;
}


export interface Post {
  id: string;
  name: string; // Title for all types
  description: string;
  imageUrl: string;
  imageAlt?: string;
  category: Category | null;
  keywords?: string | string[]; // Allow both for backward compatibility
  postType: PostType;
  author: string; // Public-facing name of the team member
  bookmarkedBy?: string[]; // Array of user UIDs who have bookmarked
  createdAt: Timestamp;
  updatedAt: Timestamp;
  status: PostStatus;
  isHot?: boolean;
  comments?: Comment[];
  
  // Audit fields
  authorId: string; // UID of the logged-in user who last saved the post
  authorEmail: string; // Email of the logged-in user who last saved the post
  createdBy?: AuditInfo;
  publishedBy?: AuditInfo;
}

export const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  imageUrl: z.string().min(1, 'Image is required.'),
  imageAlt: z.string().optional(),
  category: z.string().nullable(),
  keywords: z.string().optional(),
  postType: z.enum(postTypes).default('news'),
  author: z.string().min(1, 'Public author name is required.'),
  authorId: z.string(),
  authorEmail: z.string().email(),
  status: z.enum(['draft', 'published']),
});

export const CommentSchema = z.object({
    postId: z.string(),
    userId: z.string(),
    userName: z.string(),
    userEmail: z.string().email(),
    text: z.string().min(1, "Comment cannot be empty."),
    parentId: z.string().nullable().optional(),
});

export const UpdateCommentSchema = z.object({
    postId: z.string(),
    commentId: z.string(),
    userId: z.string(),
    text: z.string().min(1, "Comment cannot be empty."),
});

// New schema for categories
export const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required.'),
  slug: z.string().min(1, 'Category slug is required.'),
});
