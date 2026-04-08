'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCategory(formData: FormData) {
    const supabase = await createClient();
    const name = formData.get('name') as string;
    const icon = formData.get('icon') as string;

    const { error } = await supabase.from('payment_categories').insert([
        { name, icon }
    ]);

    if (!error) {
        revalidatePath('/settings/categories');
    }
}

export async function toggleCategoryStatus(id: string, isActive: boolean) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('payment_categories')
        .update({ is_active: !isActive })
        .eq('id', id);

    if (!error) {
        revalidatePath('/settings/categories');
    }
}

export async function deleteCategory(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('payment_categories')
        .delete()
        .eq('id', id);

    if (!error) {
        revalidatePath('/settings/categories');
    }
}
