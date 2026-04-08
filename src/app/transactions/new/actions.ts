'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function addTransaction(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const type = formData.get('type') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const transaction_fee = parseFloat(formData.get('transaction_fee') as string) || 0;
    const customer_name = formData.get('customer_name') as string;
    const phone_number = formData.get('phone_number') as string;
    const category_id = formData.get('category_id') as string;
    const note = formData.get('note') as string;

    const { error } = await supabase.from('transactions').insert([
        {
            type,
            amount,
            transaction_fee,
            customer_name,
            phone_number,
            category_id,
            note,
            created_by: user.id
        }
    ]);

    if (!error) {
        revalidatePath('/transactions/history');
        redirect('/transactions/history');
    } else {
        // Handle error (e.g., redirect with error parameter)
        redirect('/transactions/new?error=Failed to save transaction');
    }
}
