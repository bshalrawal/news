

'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { saveReview, uploadImage } from '@/lib/actions';
import type { Post, PostStatus } from '@/lib/types';
import { FormSchema } from '@/lib/types';
import { ADMIN_EMAILS } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import dynamic from 'next/dynamic';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { describeImage } from '@/ai/flows/describe-image-flow';
import { Textarea } from '@/components/ui/textarea';
import { getCategories } from '@/lib/categories.actions';
import { Switch } from '@/components/ui/switch';
import type { Category } from '@/lib/types';

const TiptapEditor = dynamic(() => import('./TiptapEditor').then(mod => mod.TiptapEditor), {
  ssr: false,
  loading: () => <Skeleton className="min-h-[600px] w-full rounded-md" />,
});

type FormValues = z.infer<typeof FormSchema>;

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  const [isSubmitting, startSubmitting] = useTransition();
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [isDescribingImage, setIsDescribingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }
    fetchCategories();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: post?.id,
      name: post?.name || '',
      description: post?.description || '',
      imageUrl: post?.imageUrl || null,
      imageAlt: post?.imageAlt || null,
      keywords: Array.isArray(post?.keywords) ? post.keywords.join(', ') : (post?.keywords || ''),
      category: post?.category || null,
      categorySlug: post?.categorySlug || null,
      postNo: post?.postNo,
      postSlug: post?.postSlug,
      postType: post?.postType || 'news',
      author: post?.author || null,
      isHot: post?.isHot || false,
      isFeatured: post?.isFeatured || false,
    },
  });

  const { watch, control, setValue, getValues, trigger } = form;

  const imageUrl = watch('imageUrl');

  const isPublisher = user && ADMIN_EMAILS.includes(user.email ?? '');

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'अमान्य फाइल', description: 'कृपया छवि फाइल चयन गर्नुहोस्।' });
      return;
    }

    setIsLoadingImage(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;

      // New: Upload to Cloudinary
      const uploadResult = await uploadImage(dataUri);

      setIsLoadingImage(false);

      if (uploadResult.success && uploadResult.url) {
        setValue('imageUrl', uploadResult.url, { shouldValidate: true });
        toast({ title: 'सफलता', description: 'छवि सफलतापूर्वक अपलोड भयो।' });
      } else {
        toast({ variant: 'destructive', title: 'त्रुटि', description: uploadResult.message });
      }
    };
    reader.onerror = () => {
      setIsLoadingImage(false);
      toast({ variant: 'destructive', title: 'त्रुटि', description: 'छवि फाइल पढ्न असफल भयो।' });
    };
    reader.readAsDataURL(file);
  };

  const handleDescribeImage = async () => {
    const currentImageUrl = getValues('imageUrl');
    if (!currentImageUrl) {
      toast({ variant: 'destructive', title: 'छवि छैन', description: 'कृपया पहिले छवि अपलोड वा लिङ्क गर्नुहोस्।' });
      return;
    }

    setIsDescribingImage(true);
    try {
      // AI description works with remote URLs, but we need to fetch the image data first.
      // This is complex. For now, we will assume the user pastes a data URI if they want to use this.
      // Or we adjust to fetch the URL. Let's try fetching.
      const response = await fetch(currentImageUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      const describePromise = new Promise<void>((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const dataUri = reader.result as string;
            const result = await describeImage({ imageDataUri: dataUri });
            if (result.description) {
              setValue('imageAlt', result.description, { shouldValidate: true });
              toast({ title: 'सफलता', description: 'छवि विवरण उत्पन्न भयो।' });
              resolve();
            } else {
              throw new Error('कुनै विवरण फिर्ता भएन।');
            }
          } catch (e) {
            reject(e);
          }
        }
        reader.onerror = () => {
          reject(new Error('Failed to read image data for AI description.'));
        }
        reader.readAsDataURL(blob);
      });

      await describePromise;

    } catch (error) {
      console.error("छवि वर्णन गर्दा त्रुटि:", error);
      toast({ variant: 'destructive', title: 'AI त्रुटि', description: 'छवि विवरण उत्पन्न गर्न सकेन। URL बाट छवि ल्याउन असफल भएको हुन सक्छ।' });
    } finally {
      setIsDescribingImage(false);
    }
  };


  const handleFormSubmit = async (status: PostStatus) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'प्रमाणीकरण त्रुटि', description: 'पोस्ट बचत गर्न तपाईं लग इन हुनुपर्छ।' });
      return;
    }

    if (status === 'published' && !isPublisher) {
      toast({ variant: 'destructive', title: 'अनुमति अस्वीकृत', description: 'तपाईंसँग पोस्टहरू प्रकाशित गर्ने अनुमति छैन।' });
      return;
    }

    setValue('status', status); // Ensure status is set for validation
    const isValid = await trigger();
    if (!isValid) {
      toast({ variant: 'destructive', title: 'अमान्य फारम', description: 'कृपया सबै आवश्यक क्षेत्रहरू सही रूपमा भर्नुहोस्।' });
      console.log("Form Errors: ", form.formState.errors);
      return;
    }

    const values = getValues();
    const dataToSave = {
      ...values,
      status: status,
    };

    startSubmitting(async () => {
      const result = await saveReview(dataToSave, user.uid, user.email || 'unknown');

      if (result.success) {
        toast({ title: 'सफलता', description: result.message });
        router.push('/admin');
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'त्रुटि',
          description: result.message || 'एक अप्रत्याशित त्रुटि भयो।',
        });
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>पोस्ट शीर्षक</FormLabel>
              <FormControl><Input placeholder="उदाहरण, काठमाडौंले नयाँ पर्यटन पहलको घोषणा गर्‍यो" {...field} disabled={isSubmitting} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 p-4 border rounded-lg bg-secondary/30">
          <div className="space-y-2">
            <Label>विशेष छवि (वैकल्पिक)</Label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoadingImage || isSubmitting}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isLoadingImage ? 'अपलोड हुँदै...' : 'छवि अपलोड गर्नुहोस्'}
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
                disabled={isLoadingImage || isSubmitting}
              />
              <FormField
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="flex-grow w-full">
                    <FormControl>
                      <Input
                        placeholder="वा छवि URL टाँस्नुहोस्"
                        {...field}
                        value={field.value ?? ''}
                        disabled={isLoadingImage || isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {isLoadingImage && <Progress value={undefined} className="w-full h-2 animate-pulse" />}
          </div>

          <FormField
            control={control}
            name="imageAlt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>छवि विवरण (Alt Text)</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Textarea
                      placeholder="SEO र पहुँचको लागि छविको वर्णनात्मक क्याप्शन।"
                      {...field}
                      value={field.value ?? ''}
                      disabled={isSubmitting || isDescribingImage}
                      rows={2}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleDescribeImage}
                    disabled={isSubmitting || isDescribingImage || !imageUrl}
                    title="AI मार्फत उत्पन्न गर्नुहोस्"
                  >
                    <Sparkles className={cn("h-4 w-4", isDescribingImage && "animate-spin")} />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  यो पाठ SEO को लागी महत्वपूर्ण छ। तपाईं यसलाई आफै लेख्न सक्नुहुन्छ वा AI मार्फत उत्पन्न गर्न सक्नुहुन्छ।
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>पोस्ट सामग्री</FormLabel>
              <FormControl>
                <TiptapEditor
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>श्रेणी</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const selectedCat = categories.find(c => c.name === value);
                    field.onChange(value);
                    setValue('categorySlug', selectedCat?.slug || null);
                  }}
                  value={field.value ?? undefined}
                >
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="एउटा श्रेणी चयन गर्नुहोस्" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.slug} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel>कीवर्डहरू</FormLabel>
                <FormControl><Input placeholder="उदाहरण पर्यटन, अर्थव्यवस्था, सरकार" {...field} value={field.value ?? ''} disabled={isSubmitting} /></FormControl>
                <p className="text-sm text-muted-foreground">राम्रो खोज योग्यताको लागि अल्पविराम-विभाजित कीवर्डहरू।</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>लेखकको नाम (वैकल्पिक)</FormLabel>
                <FormControl>
                  <Input placeholder="उदाहरण, अतिथि लेखक" {...field} value={field.value ?? ''} disabled={isSubmitting} />
                </FormControl>
                <FormDescription>
                  यदि खाली छोडियो भने, कुनै लेखक देखाइने छैन।
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="isHot"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">ट्रेन्डिङ हो?</FormLabel>
                    <FormDescription>
                      यो पोस्टलाई ट्रेन्डिङको रूपमा चिन्ह लगाउनुहोस्।
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-secondary/30">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">विशेष रुपले प्रदर्शित गर्ने?</FormLabel>
                    <FormDescription>
                      गृहपृष्ठको श्रेणी खण्डमा यो पोस्ट देखाउनुहोस्।
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">छवि पूर्वावलोकन</Label>
          <div className="mt-2 relative w-full aspect-video max-w-sm rounded-md overflow-hidden border bg-muted flex items-center justify-center">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-muted-foreground">छवि पूर्वावलोकन</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleFormSubmit('draft')}
            disabled={isSubmitting || isLoadingImage}
          >
            {isSubmitting ? 'बचत गर्दै...' : 'ड्राफ्टको रूपमा बचत गर्नुहोस्'}
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={() => handleFormSubmit('published')}
            disabled={isSubmitting || !isPublisher || isLoadingImage}
            title={!isPublisher ? "तपाईंलाई प्रकाशित गर्ने अनुमति छैन" : "पोस्ट प्रकाशित गर्नुहोस्"}
          >
            {isSubmitting
              ? (post ? 'पोस्ट अपडेट गर्दै...' : 'पोस्ट प्रकाशित गर्दै...')
              : (post ? 'अद्यावधिक र प्रकाशित गर्नुहोस्' : 'पोस्ट प्रकाशित गर्नुहोस्')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
