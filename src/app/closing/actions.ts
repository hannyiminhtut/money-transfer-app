'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function closeDay(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const date = formData.get('date') as string;
    const totalIn = parseFloat(formData.get('totalIn') as string);
    const totalOut = parseFloat(formData.get('totalOut') as string);

    const { error } = await supabase.from('daily_closings').insert([
        {
            date,
            total_in: totalIn,
            total_out: totalOut,
            closed_by: user.id
        }
    ]);

    if (error) {
        if (error.code === '23505') {
            redirect('/closing?error=This day has already been closed.');
        }
        redirect(`/closing?error=${encodeURIComponent(error.message)}`);
    }

    revalidatePath('/closing');
    redirect('/closing');
}
