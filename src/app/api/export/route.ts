import { createClient } from '@/utils/supabase/server';
import { format } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    const period = searchParams.get('period'); // yyyy-MM

    let query = supabase
        .from('transactions')
        .select(`
      id, created_at, type, amount, phone_number, note,
      payment_categories ( name ),
      profiles ( full_name )
    `)
        .order('created_at', { ascending: false });

    if (period) {
        const [yearStr, monthStr] = period.split('-');
        const startDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, 1);
        const endDate = new Date(parseInt(yearStr), parseInt(monthStr), 0, 23, 59, 59, 999);

        query = query
            .gte('created_at', format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"))
            .lte('created_at', format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
    }

    const { data: transactions, error } = await query;

    if (error || !transactions) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    // Create CSV String
    const headers = ['Date', 'Time', 'Type', 'Amount (MMK)', 'Provider', 'Phone Number', 'Staff', 'Note'];

    const rows = transactions.map(t => {
        const date = format(new Date(t.created_at), 'yyyy-MM-dd');
        const time = format(new Date(t.created_at), 'HH:mm:ss');
        const note = t.note ? `"${t.note.replace(/"/g, '""')}"` : ''; // Escape quotes
        const cat = t.payment_categories as any;
        const prof = t.profiles as any;
        return [
            date,
            time,
            t.type,
            t.amount,
            cat?.name || 'Unknown',
            t.phone_number || '',
            prof?.full_name || 'Unknown',
            note
        ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    const filename = period ? `transactions_${period}.csv` : 'transactions_all.csv';

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
