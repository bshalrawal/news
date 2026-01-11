
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/app/components/Footer';
import { teamMembers } from '@/lib/config';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'हाम्रो बारेमा | विधि न्यूज',
  description: 'विधि न्यूज पछाडिको टोलीको बारेमा थप जान्नुहोस्, नेपालबाट समीक्षा र समाचारहरूको लागि तपाईंको विश्वसनीय स्रोत।',
};

const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}


export default function AboutUsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold font-headline">विधि न्यूजको बारेमा</CardTitle>
            <CardDescription className="text-lg text-muted-foreground pt-2">
                नेपालबाट समीक्षा र समाचारहरूको लागि तपाईंको विश्वसनीय स्रोत।
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-center text-lg leading-relaxed text-foreground/80">
              विधि न्यूजमा स्वागत छ, नेपाल भरिबाट समयमै र सही समाचार कभरेज र समीक्षाहरूको लागि तपाईंको प्रमुख स्रोत। हाम्रो लक्ष्य राजनीति, व्यापार, संस्कृति, र घटनाहरूमा अन्तर्दृष्टिपूर्ण रिपोर्टिङ प्रदान गर्नु हो। हामी तपाईंलाई सूचित राख्न समर्पित पत्रकार र विकासकर्ताहरूको एक भावुक टोली हौं।
            </p>
            
            <Separator />

            <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold font-headline text-center">हाम्रो टोलीलाई भेट्नुहोस्</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {teamMembers.map((member) => (
                        <div key={member.name} className="flex flex-col items-center text-center p-4 rounded-lg bg-secondary/50">
                            <Avatar className="h-16 w-16 mb-3">
                                <AvatarFallback className="text-xl bg-primary/20 text-primary font-semibold">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold text-lg">{member.name}</h3>
                            <p className="text-muted-foreground">{member.role}</p>
                        </div>
                    ))}
                </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
