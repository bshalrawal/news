
'use client';

import { useState, useTransition, useEffect } from 'react';
import { deleteCategory, updateCategoryOrder } from '@/lib/categories.actions';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '@/components/ui/table';
import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import type { Category } from '@/lib/types';

export function CategoryList({ initialCategories }: { initialCategories: Category[] }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [categories, setCategories] = useState(initialCategories);

    useEffect(() => {
        setCategories(initialCategories);
    }, [initialCategories]);

    const handleDelete = async (slug: string) => {
        const result = await deleteCategory(slug);
        if (result.success) {
            toast({ title: 'सफलता', description: result.message });
            setCategories(cats => cats.filter(c => c.slug !== slug));
        } else {
            toast({ variant: 'destructive', title: 'त्रुटि', description: result.message });
        }
    }
    
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newCategories = [...categories];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newCategories.length) {
            return;
        }

        // Swap positions
        [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];
        
        // Update order property
        newCategories.forEach((cat, idx) => {
            cat.order = idx;
        });

        setCategories(newCategories);

        startTransition(async () => {
            const result = await updateCategoryOrder(newCategories);
            if (result.success) {
                toast({ title: 'सफलता', description: result.message });
            } else {
                toast({ variant: 'destructive', title: 'त्रुटि', description: 'अर्डर अद्यावधिक गर्न असफल भयो।' });
                 // Revert on failure
                setCategories(categories);
            }
        });
    };

    if (categories.length === 0) {
        return <p className="text-muted-foreground text-center">कुनै श्रेणी भेटिएन।</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>नाम</TableHead>
                    <TableHead className="text-right">कार्यहरू</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {categories.map((category, index) => (
                    <TableRow key={category.slug}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'up')} disabled={index === 0 || isPending}>
                                <ArrowUp className="h-4 w-4" />
                           </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleMove(index, 'down')} disabled={index === categories.length - 1 || isPending}>
                                <ArrowDown className="h-4 w-4" />
                           </Button>
                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                 <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>के तपाईँ निश्चित हुनुहुन्छ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    यसले स्थायी रूपमा &quot;{category.name}&quot; श्रेणी मेटाउनेछ। यो कार्यलाई पूर्ववत गर्न सकिँदैन।
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>रद्द गर्नुहोस्</AlertDialogCancel>
                                  <form action={() => handleDelete(category.slug)}>
                                    <AlertDialogAction type="submit">मेटाउनुहोस्</AlertDialogAction>
                                  </form>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
