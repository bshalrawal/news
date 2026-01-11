
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addCategory } from '@/lib/categories.actions';
import { useTransition } from 'react';

function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
}

const CategoryFormSchema = z.object({
  name: z.string().min(2, { message: 'श्रेणीको नाम कम्तिमा २ अक्षरको हुनुपर्छ।' }),
  slug: z.string().min(2, { message: 'स्लग कम्तिमा २ अक्षरको हुनुपर्छ।' }),
});

export function CategoryForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof CategoryFormSchema>>({
    resolver: zodResolver(CategoryFormSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  });

  const watchName = form.watch('name');
  
  // This effect will automatically generate a slug as the user types the name
  // The user can then override it if they wish.
  useTransition(() => {
      const suggestedSlug = generateSlug(watchName);
      if (suggestedSlug !== form.getValues('slug')) {
          form.setValue('slug', suggestedSlug, { shouldValidate: true });
      }
  });


  function onSubmit(data: z.infer<typeof CategoryFormSchema>) {
    startTransition(async () => {
      const result = await addCategory(data);
      if (result.success) {
        toast({ title: 'सफलता', description: result.message });
        form.reset();
      } else {
        toast({ variant: 'destructive', title: 'त्रुटि', description: result.message });
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>श्रेणीको नाम</FormLabel>
              <FormControl>
                <Input placeholder="उदाहरण, राजनीति" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug (URL को लागि अंग्रेजीमा)</FormLabel>
              <FormControl>
                <Input placeholder="उदाहरण, politics" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'थप्दै...' : 'श्रेणी थप्नुहोस्'}
        </Button>
      </form>
    </Form>
  );
}
