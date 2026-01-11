
'use client';

import { useState, useEffect } from 'react';
import { getCurrentNepaliDateLine } from '@/lib/nepali-date-utils';

export function NepaliDateTime() {
    const [date, setDate] = useState('');

    useEffect(() => {
        // This code now runs only on the client, after hydration
        setDate(getCurrentNepaliDateLine());
    }, []); // Empty dependency array ensures it runs once on mount

    // Render nothing on the server and during the initial client render
    if (!date) {
        return null;
    }

    return <span className="text-sm text-muted-foreground tabular-nums font-mukta">{date}</span>;
}
