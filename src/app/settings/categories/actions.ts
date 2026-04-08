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

    // If real hard-delete fails (likely due to Foreign Key constraint), do a soft-delete instead!
    if (error) {
        await supabase
            .from('payment_categories')
            .update({ is_active: false })
            .eq('id', id);
    }

    revalidatePath('/settings/categories');
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm') as string;

    if (password !== confirm) {
        // Simple error handling approach without external libs
        // You would normally use URL params, but we just revalidate auth state for simplicity here
        return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (!error) {
        revalidatePath('/settings/categories');
    }
}
