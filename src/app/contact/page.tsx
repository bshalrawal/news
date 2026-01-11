
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Footer } from '@/app/components/Footer';
import type { Metadata } from 'next';

const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'नाम कम्तिमा २ अक्षरको हुनुपर्छ।' }),
  email: z.string().email({ message: 'कृपया मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।' }),
  subject: z.string().min(5, { message: 'विषय कम्तिमा ५ अक्षरको हुनुपर्छ।' }),
  message: z.string().min(10, { message: 'सन्देश कम्तिमा १० अक्षरको हुनुपर्छ।' }),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit: SubmitHandler<ContactFormInputs> = (data) => {
    // Here you would typically handle form submission, e.g., send an email or save to a database.
    // For this demo, we'll just show a success toast.
    console.log(data);
    toast({
      title: 'सन्देश पठाइयो!',
      description: 'हामीले तपाईंको सन्देश प्राप्त गर्यौं र चाँडै नै सम्पर्क गर्नेछौं।',
    });
    form.reset();
  };

  return (
    <>
    <main className="flex-1 container mx-auto px-4 py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">हामीलाई सम्पर्क गर्नुहोस्</CardTitle>
          <CardDescription className="text-lg text-muted-foreground pt-2">
            प्रश्नहरू छन्? हामी मद्दत गर्न यहाँ छौं।
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>तपाईंको नाम</FormLabel>
                    <FormControl>
                      <Input placeholder="उदाहरण, राम थापा" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>इमेल</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ram@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>विषय</FormLabel>
                    <FormControl>
                      <Input placeholder="तपाईंको सन्देशको विषय" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>तपाईंको सन्देश</FormLabel>
                    <FormControl>
                      <Textarea placeholder="यहाँ आफ्नो सन्देश टाइप गर्नुहोस्..." rows={6} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'पठाउँदै...' : 'सन्देश पठाउनुहोस्'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h3 className="text-2xl font-bold font-headline mb-4">अन्य जानकारी</h3>
        <p className="text-muted-foreground">
            <strong>इमेल:</strong> contact@bidhinews.com <br />
            <strong>फोन:</strong> +९७७-९८XXXXXXXX <br />
            <strong>ठेगाना:</strong> काठमाडौँ, नेपाल
        </p>
      </div>
    </main>
    <Footer />
    </>
  );
}
