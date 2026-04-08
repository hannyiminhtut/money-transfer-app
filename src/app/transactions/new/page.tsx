import { createClient } from '@/utils/supabase/server';
import { addTransaction } from './actions';
import { CreditCard, Wallet, Smartphone, Banknote, Landmark, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import Link from 'next/link';
import { Translate } from '@/components/Translate';

export default async function NewTransactionPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // Fetch active categories
    const { data: categories } = await supabase
        .from('payment_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

    const getIconComponent = (iconName: string) => {
        switch (iconName) {
            case 'wallet': return <Wallet className="w-6 h-6" />;
            case 'smartphone': return <Smartphone className="w-6 h-6" />;
            case 'banknote': return <Banknote className="w-6 h-6" />;
            case 'landmark': return <Landmark className="w-6 h-6" />;
            default: return <CreditCard className="w-6 h-6" />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900"><Translate tKey="transaction.new" /></h1>
                <Link
                    href="/transactions/history"
                    className="px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                    <Translate tKey="transaction.viewHistory" />
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-8">
                {searchParams.error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm">
                        {searchParams.error}
                    </div>
                )}

                <form action={addTransaction} className="space-y-8">

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3"><Translate tKey="transaction.transactionType" /></label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="relative cursor-pointer group">
                                <input type="radio" name="type" value="IN" className="peer sr-only" required defaultChecked />
                                <div className="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 peer-checked:border-green-500 peer-checked:bg-green-50 transition-all border-gray-200 group-hover:bg-gray-50">
                                    <ArrowDownCircle className="w-6 h-6 text-green-600" />
                                    <span className="font-bold text-lg text-gray-900"><Translate tKey="dashboard.moneyIn" /></span>
                                </div>
                            </label>

                            <label className="relative cursor-pointer group">
                                <input type="radio" name="type" value="OUT" className="peer sr-only" required />
                                <div className="flex items-center justify-center space-x-2 p-4 rounded-xl border-2 peer-checked:border-red-500 peer-checked:bg-red-50 transition-all border-gray-200 group-hover:bg-gray-50">
                                    <ArrowUpCircle className="w-6 h-6 text-red-600" />
                                    <span className="font-bold text-lg text-gray-900"><Translate tKey="dashboard.moneyOut" /></span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Payment Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3"><Translate tKey="transaction.paymentProvider" /></label>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                            {categories?.map((cat) => (
                                <label key={cat.id} className="relative cursor-pointer group">
                                    <input type="radio" name="category_id" value={cat.id} className="peer sr-only" required />
                                    <div className="flex flex-col items-center justify-center p-4 h-full rounded-xl border-2 peer-checked:border-blue-600 peer-checked:bg-blue-50 transition-all border-gray-200 group-hover:bg-gray-50 space-y-2">
                                        <div className="text-gray-600 peer-checked:text-blue-600">
                                            {getIconComponent(cat.icon)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 text-center">{cat.name}</span>
                                    </div>
                                </label>
                            ))}
                            {(!categories || categories.length === 0) && (
                                <div className="col-span-3 text-red-500 text-sm"><Translate tKey="transaction.noCategories" /></div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2"><Translate tKey="transaction.amountLabel" /></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-4 pr-12 py-3 text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="0.00"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ks</span>
                            </div>
                        </div>

                        {/* Transaction Fee */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2"><Translate tKey="transaction.feeLabel" /></label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="transaction_fee"
                                    min="0"
                                    step="1"
                                    defaultValue="0"
                                    className="w-full pl-4 pr-12 py-3 text-lg font-bold bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="0"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Ks</span>
                            </div>
                        </div>

                        {/* Customer Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2"><Translate tKey="transaction.customerLabel" /></label>
                            <input
                                type="text"
                                name="customer_name"
                                className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="..."
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2"><Translate tKey="transaction.phoneLabel" /></label>
                            <input
                                type="tel"
                                name="phone_number"
                                className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="09..."
                            />
                        </div>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2"><Translate tKey="transaction.noteLabel" /></label>
                        <input
                            type="text"
                            name="note"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder=""
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-200"
                    >
                        <Translate tKey="transaction.save" />
                    </button>
                </form>
            </div>
        </div>
    );
}
