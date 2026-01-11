

'use client';

import type { Post } from '@/lib/types';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatToNepaliDate } from '@/lib/nepali-date-utils';
import { PostsList } from '@/app/components/PostsList';
import { Footer } from '@/app/components/Footer';
import { Card } from '@/components/ui/card';
import { PostCard } from '@/app/components/PostCard';
import { Separator } from '@/components/ui/separator';
import { getPostUrl } from '@/lib/utils';

interface CategoryPosts {
    category: string;
    posts: Post[];
}

interface HomePageContentProps {
    postsWithImage: Post[];
    textOnlyPosts: Post[];
    categoryPosts: CategoryPosts[];
}

export function HomePageContent({ postsWithImage, textOnlyPosts, categoryPosts }: HomePageContentProps) {

    if (postsWithImage.length === 0 && textOnlyPosts.length === 0) {
        return (
            <Card className="flex items-center justify-center p-8 text-center text-muted-foreground bg-secondary/30 h-64">
                <p>अहिलेसम्म कुनै पोष्ट उपलब्ध छैन। चाँडै फेरि जाँच गर्नुहोस्!</p>
            </Card>
        )
    }

    const featuredPost = postsWithImage[0];
    const secondPost = postsWithImage[1];
    const latestUpdates = postsWithImage.slice(2, 6);

    // Create a set of IDs for posts already displayed in the hero sections to avoid duplication in "More Updates" or "More News"
    const displayedPostIds = new Set([
        featuredPost?.id,
        secondPost?.id,
        ...latestUpdates.map(p => p.id)
    ].filter(Boolean));


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Main Featured Story (Left 2/3) - Priority for Trending */}
                <div className="lg:col-span-2">
                    {featuredPost && (
                        <Link href={getPostUrl(featuredPost)} className="group block relative w-full h-[400px] md:h-[550px] lg:h-[650px] rounded-[2px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                            {featuredPost.imageUrl ? (
                                <img
                                    src={featuredPost.imageUrl}
                                    alt={featuredPost.imageAlt || featuredPost.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-muted flex items-center justify-center text-4xl text-muted-foreground font-bold">1200 x 800</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white w-full">
                                <div className="flex gap-2 mb-4">
                                    {featuredPost.isHot && (
                                        <Badge className="bg-red-600 hover:bg-red-700 border-none text-white px-4 py-1.5 text-base font-bold rounded-full font-mukta uppercase">
                                            ट्रेन्डिङ
                                        </Badge>
                                    )}
                                    {featuredPost.category && (
                                        <Badge className="bg-primary hover:bg-primary/90 border-none text-white px-4 py-1.5 text-base font-bold rounded-full font-mukta uppercase">
                                            {featuredPost.category}
                                        </Badge>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold font-mukta leading-tight mb-4 group-hover:text-gray-100 transition-colors drop-shadow-lg">
                                    {featuredPost.name}
                                </h1>
                                <div className="flex items-center text-gray-300 text-lg font-mukta gap-4">
                                    <span>{formatToNepaliDate(featuredPost.createdAt as any)}</span>
                                </div>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Right Sidebar (1/3) */}
                <div className="flex flex-col gap-8">
                    {/* Secondary Image Post */}
                    {secondPost && (
                        <Link href={getPostUrl(secondPost)} className="group block relative w-full aspect-[4/3] rounded-[2px] overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
                            {secondPost.imageUrl ? (
                                <img
                                    src={secondPost.imageUrl}
                                    alt={secondPost.imageAlt || secondPost.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-muted flex items-center justify-center text-2xl text-muted-foreground font-bold">Secondary Image</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                                <div className="flex gap-2 mb-4">
                                    {secondPost.isHot && (
                                        <Badge className="bg-red-600 border-none text-white px-2 py-0.5 text-[10px] font-bold rounded-full font-mukta">
                                            ट्रेन्डिङ
                                        </Badge>
                                    )}
                                    {secondPost.category && (
                                        <Badge className="bg-primary border-none text-white px-3 py-1 text-xs font-bold rounded-full font-mukta">
                                            {secondPost.category}
                                        </Badge>
                                    )}
                                </div>
                                <h2 className="text-xl font-bold font-mukta leading-tight group-hover:text-gray-100 transition-colors line-clamp-3">
                                    {secondPost.name}
                                </h2>
                                <div className="mt-2 text-gray-300 text-xs font-mukta">
                                    {formatToNepaliDate(secondPost.createdAt as any)}
                                </div>
                            </div>
                        </Link>
                    )}

                    {/* Latest Updates Section */}
                    <div className="bg-[#fcfcfc] rounded-[2px] border border-muted/30 p-6 shadow-sm flex-1">
                        <h3 className="text-xl font-bold mb-6 font-mukta flex items-center text-foreground">
                            <span className="w-1.5 h-6 bg-primary mr-4 rounded-full"></span>
                            ताजा अपडेट
                        </h3>
                        <div className="space-y-6">
                            {latestUpdates.map((post) => (
                                <Link key={post.id} href={getPostUrl(post)} className="block group">
                                    <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-snug font-mukta mb-2">
                                        {post.name}
                                    </h4>
                                    <div className="text-muted-foreground text-sm font-mukta">
                                        {formatToNepaliDate(post.createdAt as any)}
                                    </div>
                                    <div className="mt-4 border-b border-muted/50 last:border-0"></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Text Only Column Below Hero */}
            {textOnlyPosts.length > 0 && (
                <div className="mb-12 border-t pt-8">
                    <h3 className="text-xl font-bold mb-6 font-mukta flex items-center text-foreground">
                        <span className="w-2 h-8 bg-primary mr-4 rounded-sm"></span>
                        थप अपडेटहरू
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                        {textOnlyPosts.map((post) => {
                            if (displayedPostIds.has(post.id)) return null;
                            // Add to displayed IDs so they don't show in categories or bottom grid
                            displayedPostIds.add(post.id);
                            return (
                                <Link key={post.id} href={getPostUrl(post)} className="group block border-l-2 border-muted hover:border-primary pl-4 transition-colors">
                                    <h4 className="font-bold text-lg font-mukta group-hover:text-primary transition-colors line-clamp-2">
                                        {post.name}
                                    </h4>
                                    <span className="text-sm text-muted-foreground font-mukta">
                                        {formatToNepaliDate(post.createdAt as any)}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Other Sections */}
            <div className="space-y-16">
                {/* Display category sections - Showing Featured Posts */}
                {categoryPosts.map(({ category, posts }) => {
                    // Note: We don't filter featured posts by displayedPostIds because the user specifically 
                    // requested that featured posts appear below their respective category.
                    // However, we track them in displayedPostIds to avoid showing them in "Remaining Posts Grid".
                    posts.forEach(p => displayedPostIds.add(p.id));

                    return (
                        <div key={category}>
                            <PostsList title={category} posts={posts} loading={false} />
                        </div>
                    );
                })}

                {/* Remaining Posts Grid */}
                {postsWithImage.length + textOnlyPosts.length > displayedPostIds.size && (
                    <div className="border-t pt-12">
                        <h3 className="text-2xl font-bold mb-8 font-mukta flex items-center">
                            <span className="w-2 h-8 bg-primary mr-4 rounded-sm"></span>
                            थप समाचार
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...postsWithImage, ...textOnlyPosts].map((post) => {
                                if (displayedPostIds.has(post.id)) return null;
                                displayedPostIds.add(post.id);
                                return (
                                    <PostCard key={post.id} review={post} />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
}
