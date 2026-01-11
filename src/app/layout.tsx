
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Mukta, Playfair_Display } from 'next/font/google';
import { AppShell } from '@/app/components/AppShell';
import { getCategories } from '@/lib/categories.actions';
import type { Category } from '@/lib/types';

const mukta = Mukta({
  subsets: ['devanagari', 'latin'],
  variable: '--font-mukta',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700'],
});


export const metadata: Metadata = {
  title: {
    default: 'विधि न्यूज | नेपालमा समीक्षा र समाचारको लागि तपाईंको स्रोत',
    template: '%s | विधि न्यूज',
  },
  description: 'नेपाल भरिबाट समीक्षा, ताजा समाचार, कथाहरू, र अद्यावधिकहरूको लागि तपाईंको अन्तिम स्रोत। विधि न्यूजसँग सूचित रहनुहोस्।',
  openGraph: {
    title: 'विधि न्यूज',
    description: 'नेपाल भरिबाट समीक्षा, ताजा समाचार, कथाहरू, र अद्यावधिकहरूको लागि तपाईंको अन्तिम स्रोत।',
    url: 'https://bidhinews.com',
    siteName: 'विधि न्यूज',
    images: [
      {
        url: 'https://bidhinews.com/og-image.png', // TBD: Add a default OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ne_NP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'विधि न्यूज',
    description: 'नेपाल भरिबाट समीक्षा, ताजा समाचार, कथाहरू, र अद्यावधिकहरूको लागि तपाईंको अन्तिम स्रोत।',
    // images: ['https://bidhinews.com/og-image.png'], // TBD: Add a default OG image
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories: Category[] = await getCategories();

  return (
    <html lang="ne" suppressHydrationWarning className={`${mukta.variable} ${playfair.variable}`}>
      <head>
        <meta name="google-site-verification" content="R1n-N_7TPPrTZAaOSe1FKgDWs55r_J9Q4dA-42ucWDc" />
      </head>
      <body className="antialiased min-h-screen bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppShell categories={categories}>
              {children}
            </AppShell>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
