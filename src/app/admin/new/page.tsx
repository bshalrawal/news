
import { PostForm } from '../components/ReviewForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewReviewPage() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline text-2xl">नयाँ लेख सिर्जना गर्नुहोस्</CardTitle>
            <CardDescription>साइटमा नयाँ समाचार लेख थप्न तलका विवरणहरू भर्नुहोस्।</CardDescription>
        </CardHeader>
        <CardContent>
            <PostForm />
        </CardContent>
    </Card>
  );
}
