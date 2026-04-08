import { createClient } from '@/utils/supabase/server';
import { addCategory, deleteCategory, updatePassword } from './actions';
import { CreditCard, Wallet, Smartphone, Banknote, Landmark, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Translate } from '@/components/Translate';

export default async function CategoriesPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = await props.searchParams;
    const tab = searchParams?.tab || 'categories';

    // Only owners can manage categories, but let's fetch profile to check role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();

    if (profile?.role !== 'owner') {
        return (
            <div className="p-8 text-center bg-red-50 text-red-700 rounded-2xl">
                <h2 className="text-2xl font-bold mb-2"><Translate tKey="settings.accessDenied" /></h2>
                <p><Translate tKey="settings.ownerOnly" /></p>
            </div>
        );
    }

    const { data: categories } = await supabase
        .from('payment_categories')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'wallet': return <Wallet className="w-5 h-5" />;
            case 'smartphone': return <Smartphone className="w-5 h-5" />;
            case 'banknote': return <Banknote className="w-5 h-5" />;
            case 'landmark': return <Landmark className="w-5 h-5" />;
            default: return <CreditCard className="w-5 h-5" />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {tab === 'categories' ? <Translate tKey="settings.title" /> : <Translate tKey="settings.security" />}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {tab === 'categories' ? <Translate tKey="settings.manage" /> : <Translate tKey="settings.changePass" />}
                    </p>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-2 border-b border-gray-200 !mb-6">
                <Link href="?tab=categories" scroll={false} className={`pb-3 px-4 font-semibold text-sm transition-colors ${tab === 'categories' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Translate tKey="settings.title" />
                </Link>
                <Link href="?tab=security" scroll={false} className={`pb-3 px-4 font-semibold text-sm transition-colors ${tab === 'security' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Translate tKey="settings.security" />
                </Link>
            </div>

            {tab === 'categories' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Add New Category */}
                    <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800"><Translate tKey="settings.addCategory" /></h2>
                        <form action={addCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="settings.nameLabel" /></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="settings.iconLabel" /></label>
                                <select
                                    name="icon"
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option value="smartphone">Mobile App</option>
                                    <option value="wallet">Digital Wallet</option>
                                    <option value="banknote">Cash</option>
                                    <option value="landmark">Bank Transfer</option>
                                    <option value="creditcard">Credit Card</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <Translate tKey="settings.save" />
                            </button>
                        </form>
                    </div>

                    {/* Categories List */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        {categories?.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-full ${cat.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {getIconComponent(cat.icon)}
                                    </div>
                                    <div>
                                        <h3 className={`font-semibold text-lg ${cat.is_active ? 'text-gray-900' : 'text-gray-500'}`}>
                                            {cat.name}
                                        </h3>
                                        <span className={`text-sm font-medium ${cat.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                            {cat.is_active ? <Translate tKey="settings.active" /> : <Translate tKey="settings.disabled" />}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <form action={async () => {
                                        'use server';
                                        await deleteCategory(cat.id);
                                    }}>
                                        <button title="Delete" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))}

                        {categories?.length === 0 && (
                            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl">
                                <p className="text-gray-500"><Translate tKey="settings.noCategoriesConfig" /></p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Account Security Section */}
            {tab === 'security' && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6"><Translate tKey="settings.security" /></h2>

                    <div className="max-w-md">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800"><Translate tKey="settings.changePass" /></h3>
                        <form action={updatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="settings.newPass" /></label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="settings.confirmPass" /></label>
                                <input
                                    type="password"
                                    name="confirm"
                                    required
                                    minLength={6}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-medium rounded-lg transition-colors shadow-sm"
                            >
                                <Translate tKey="settings.updatePass" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
