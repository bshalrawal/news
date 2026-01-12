

'use client';

import Link from 'next/link';
import { collection, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, CheckCircle, Pencil, ImageOff } from 'lucide-react';
import { deleteReview, publishReview } from '@/lib/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { ADMIN_EMAILS } from '@/lib/config';
import { postTypes } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { useFormStatus } from 'react-dom';

function formatFirestoreTimestamp(timestamp: any): string {
  if (!timestamp || typeof timestamp.seconds !== 'number') {
    return 'केही समय अघि';
  }
  return formatDistanceToNow(new Date(timestamp.seconds * 1000), { addSuffix: true });
}


function AdminActionButton({ postId, isDraft }: { postId: string, isDraft: boolean }) {
  const { user } = useAuth();
  const isPublisher = user && ADMIN_EMAILS.includes(user.email ?? '');

  if (isDraft) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/admin/edit/${postId}`}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">ड्राफ्ट सम्पादन गर्नुहोस्</span>
          </Link>
        </Button>
        <form action={publishReview}>
          <input type="hidden" name="id" value={postId} />
          <input type="hidden" name="publisherId" value={user?.uid ?? ''} />
          <input type="hidden" name="publisherEmail" value={user?.email ?? ''} />
          <Button
            variant="outline"
            size="sm"
            type="submit"
            className="flex items-center gap-2"
            disabled={!user || !isPublisher}
            title={!isPublisher ? "तपाईंलाई प्रकाशित गर्ने अनुमति छैन" : "पोस्ट प्रकाशित गर्नुहोस्"}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">प्रकाशित गर्नुहोस्</span>
          </Button>
        </form>
      </div>
    );
  }
  return (
    <Button asChild variant="ghost" size="icon">
      <Link href={`/admin/edit/${postId}`}>
        <Edit className="h-4 w-4" />
        <span className="sr-only">सम्पादन गर्नुहोस्</span>
      </Link>
    </Button>
  )
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending}>
      {pending ? 'मेटाउँदै...' : 'मेटाउनुहोस्'}
    </AlertDialogAction>
  )
}

function DeleteReviewButton({ id, name }: { id: string, name: string }) {
  const deleteReviewWithId = deleteReview.bind(null, id);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="sr-only">मेटाउनुहोस्</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>के तपाईं पूर्ण रूपमा निश्चित हुनुहुन्छ?</AlertDialogTitle>
          <AlertDialogDescription>
            यो कार्यलाई पूर्ववत गर्न सकिँदैन। यसले &quot;{name}&quot; शीर्षकको पोस्टलाई स्थायी रूपमा मेटाउनेछ।
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>रद्द गर्नुहोस्</AlertDialogCancel>
          <form action={deleteReviewWithId}>
            <DeleteButton />
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function TableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden sm:table-cell">छवि</TableHead>
          <TableHead>शीर्षक</TableHead>
          <TableHead>स्थिति</TableHead>
          <TableHead className="hidden md:table-cell">अन्तिम पटक सम्पादन गरिएको</TableHead>
          <TableHead className="text-right">कार्यहरू</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, i) => (
          <TableRow key={i}>
            <TableCell className="hidden sm:table-cell"><Skeleton className="h-16 w-16 rounded-md" /></TableCell>
            <TableCell><Skeleton className="h-6 w-32 md:w-48" /></TableCell>
            <TableCell><Skeleton className="h-6 w-24" /></TableCell>
            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-32" /></TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    async function getReviews() {
      setLoading(true);
      const reviewsCollection = collection(db, 'reviews');
      const q = query(reviewsCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const reviewData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(reviewData);
      setLoading(false);
    }
    getReviews();
  }, []);

  useEffect(() => {
    let tempPosts = [...posts];

    if (searchTerm) {
      tempPosts = tempPosts.filter(post =>
        post.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      tempPosts = tempPosts.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(tempPosts);
  }, [searchTerm, statusFilter, posts]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">पोस्टहरू व्यवस्थापन गर्नुहोस्</CardTitle>
        <CardDescription>यहाँ तपाईं अवस्थित पोस्टहरू सम्पादन गर्न, प्रकाशित गर्न, वा मेटाउन सक्नुहुन्छ।</CardDescription>
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <Input
            placeholder="शीर्षक द्वारा खोज्नुहोस्..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">सबै</TabsTrigger>
                <TabsTrigger value="published">प्रकाशित</TabsTrigger>
                <TabsTrigger value="draft">ड्राफ्ट</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton />
        ) : filteredPosts.length > 0 ? (
          <TooltipProvider>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden sm:table-cell w-[80px]">छवि</TableHead>
                    <TableHead>शीर्षक</TableHead>
                    <TableHead>स्थिति</TableHead>
                    <TableHead className="hidden md:table-cell">पोष्ट मिति</TableHead>
                    <TableHead className="text-right">कार्यहरू</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="hidden sm:table-cell">
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.name} width={64} height={64} className="rounded-md object-cover h-16 w-16" />
                        ) : (
                          <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                            <ImageOff className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{post.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant={post.status === 'published' ? 'default' : 'outline'} className="capitalize cursor-help w-fit">
                                {post.status === 'published' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Pencil className="h-3 w-3 mr-1" />}
                                {post.status === 'published' ? 'प्रकाशित' : 'ड्राफ्ट'}
                              </Badge>
                            </TooltipTrigger>
                            {post.status === 'published' && post.publishedBy && (
                              <TooltipContent>
                                <p className="text-sm">द्वारा प्रकाशित: {post.publishedBy.email} ({formatFirestoreTimestamp(post.publishedBy.at)})</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                          <div className="flex gap-1">
                            {post.isHot && (
                              <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[10px] px-1.5 py-0 h-5">
                                ट्रेन्डिङ
                              </Badge>
                            )}
                            {post.isFeatured && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[10px] px-1.5 py-0 h-5">
                                विशेष
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatFirestoreTimestamp(post.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <AdminActionButton postId={post.id} isDraft={post.status === 'draft'} />
                          <DeleteReviewButton id={post.id} name={post.name} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TooltipProvider>
        ) : (
          <p className="text-center text-muted-foreground py-8">हालको फिल्टरहरूसँग कुनै पोस्ट मेल खाँदैन। आफ्नो खोज समायोजन गर्ने प्रयास गर्नुहोस्।</p>
        )}
      </CardContent>
    </Card>
  );
}


