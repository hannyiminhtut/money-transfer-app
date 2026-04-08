import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();

        // We make a simple query to the database to keep it active.
        // Even if this returns nothing or fails due to Row Level Security, 
        // it still counts as activity on the PostgreSQL database, 
        // preventing the 7-day inactivity pause.
        // Replace 'transactions' with any table name that exists in your database.
        const { data, error } = await supabase
            .from('transactions')
            .select('id')
            .limit(1);

        if (error) {
            console.log("Keep-alive query executed with expected error (such as RLS):", error.message);
        }

        return NextResponse.json({
            success: true,
            message: 'Supabase keep-alive ping successful.',
            timestamp: new Date().toISOString()
        });

    } catch (err: any) {
        return NextResponse.json({
            success: false,
            message: 'Failed to ping database.',
            error: err.message
        }, { status: 500 });
    }
}
