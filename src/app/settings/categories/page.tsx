import { createClient } from '@/utils/supabase/server';
import { addCategory, toggleCategoryStatus, deleteCategory } from './actions';
import { CreditCard, Wallet, Smartphone, Banknote, Landmark, Check, X, Trash2 } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Translate } from '@/components/Translate';

export default async function CategoriesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900"><Translate tKey="settings.title" /></h1>
                    <p className="text-gray-500 mt-1"><Translate tKey="settings.manage" /></p>
                </div>
            </div>

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
                                    await toggleCategoryStatus(cat.id, cat.is_active);
                                }}>
                                    <button
                                        title={cat.is_active ? "Disable" : "Enable"}
                                        className={`p-2 rounded-lg transition-colors ${cat.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}`}
                                    >
                                        {cat.is_active ? <X className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                    </button>
                                </form>

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
        </div>
    );
}
