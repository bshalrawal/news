
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates initials from a name.
 * @param name - The full name.
 * @returns A string with the initials.
 */
export const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  const names = name.trim().split(' ');
  if (names.length > 1 && names[names.length - 1]) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export function getPostUrl(post: { id: string; categorySlug?: string | null; postSlug?: string }) {
  if (post.categorySlug && post.postSlug) {
    return `/news/${post.categorySlug}/${post.postSlug}`;
  }
  return `/news/${post.id}`;
}
