
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCategories } from '@/lib/categories.actions';
import { CategoryForm } from './CategoryForm';
import { CategoryList } from './CategoryList';

export default async function CategoriesPage() {
    const categories = await getCategories();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">नयाँ श्रेणी थप्नुहोस्</CardTitle>
                        <CardDescription>आफ्ना लेखहरू व्यवस्थित गर्न नयाँ श्रेणी बनाउनुहोस्।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm />
                    </CardContent>
                </Card>
            </div>
             <div className="md:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">श्रेणीहरू व्यवस्थापन गर्नुहोस्</CardTitle>
                        <CardDescription>अवस्थित श्रेणीहरू हेर्नुहोस्, सम्पादन गर्नुहोस्, वा मेटाउनुहोस्।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryList initialCategories={categories} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
