
import Link from 'next/link';
import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <h3 className="font-headline text-2xl font-bold mb-2">विधि न्यूज</h3>
            <p className="text-muted-foreground">नेपालबाट समाचार र समीक्षाहरूको लागि तपाईंको विश्वसनीय स्रोत।</p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold mb-4">द्रुत लिङ्कहरू</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="text-muted-foreground hover:text-primary">गृहपृष्ठ</Link>
                <Link href="/news" className="text-muted-foreground hover:text-primary">समाचार</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-4">कानूनी</h4>
              <nav className="flex flex-col gap-2">
                <Link href="#" className="text-muted-foreground hover:text-primary">गोपनीयता नीति</Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">सेवा सर्तहरू</Link>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">हामीलाई सम्पर्क गर्नुहोस्</Link>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-4">हामीलाई पछ्याउनुहोस्</h4>
              <div className="flex gap-4">
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <a href="#" aria-label="Facebook"><Facebook /></a>
                </Button>
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <a href="#" aria-label="Twitter"><Twitter /></a>
                </Button>
                <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <a href="#" aria-label="Instagram"><Instagram /></a>
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} विधि न्यूज। सबै अधिकार सुरक्षित।</p>
        </div>
      </div>
    </footer>
  );
}
