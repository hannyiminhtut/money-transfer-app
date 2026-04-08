import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { Filter, Calendar, Users, PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';
import { Translate } from '@/components/Translate';

export default async function HistoryPage(props: {
    searchParams: Promise<{ date?: string, type?: string, category_id?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // Filtering setup
    const currentDate = format(new Date(), 'yyyy-MM-dd');
    const selectedDate = searchParams.date || currentDate;
    const selectedType = searchParams.type || '';
    const selectedCategoryId = searchParams.category_id || '';

    // Get start/end of the selected day
    const startDate = new Date(selectedDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);

    let query = supabase
        .from('transactions')
        .select(`
      *,
      payment_categories ( name, icon ),
      profiles ( full_name )
    `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });

    if (selectedType) {
        query = query.eq('type', selectedType);
    }
    if (selectedCategoryId) {
        query = query.eq('category_id', selectedCategoryId);
    }

    const { data: transactions } = await query;

    const { data: categories } = await supabase.from('payment_categories').select('*').order('name');

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900"><Translate tKey="history.title" /></h1>
                    <p className="text-gray-500 mt-1"><Translate tKey="history.viewAndFilter" /></p>
                </div>
                <Link
                    href="/transactions/new"
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium"
                >
                    <PlusCircle className="w-5 h-5" />
                    <span><Translate tKey="transaction.new" /></span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="history.date" /></label>
                        <div className="relative">
                            <input
                                type="date"
                                name="date"
                                defaultValue={selectedDate}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none"
                            />
                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="history.type" /></label>
                        <select name="type" defaultValue={selectedType} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none bg-white">
                            {/* In standard HTML select, options cannot receive complex React components as children properly without hydration warnings depending on implementation. But we can use string translation via a client component or just simple `<Translate tKey>` since Next.js supports translating inside `<option>`. */}
                            <option value=""><Translate tKey="history.allTypes" /></option>
                            <option value="IN"><Translate tKey="history.moneyIn" /></option>
                            <option value="OUT"><Translate tKey="history.moneyOut" /></option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1"><Translate tKey="history.provider" /></label>
                        <select name="category_id" defaultValue={selectedCategoryId} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-blue-500 outline-none bg-white">
                            <option value=""><Translate tKey="history.allProviders" /></option>
                            {categories?.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <button type="submit" className="w-full flex items-center justify-center space-x-2 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium">
                            <Filter className="w-4 h-4" />
                            <span><Translate tKey="history.filterBtn" /></span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                                <th className="p-4 font-semibold"><Translate tKey="history.tableTime" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableType" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableAmount" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableFee" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableProvider" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableCustomer" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tablePhone" /></th>
                                <th className="p-4 font-semibold"><Translate tKey="history.tableNote" /></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions?.map((t) => (
                                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                        {format(new Date(t.created_at), 'hh:mm a')}
                                    </td>
                                    <td className="p-4">
                                        {t.type === 'IN' ? (
                                            <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded w-fit text-xs font-bold">
                                                <ArrowDownRight className="w-3 h-3 mr-1" />
                                                IN
                                            </span>
                                        ) : (
                                            <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded w-fit text-xs font-bold">
                                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                                OUT
                                            </span>
                                        )}
                                    </td>
                                    <td className={`p-4 font-bold whitespace-nowrap ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'OUT' ? '-' : '+'}{t.amount.toLocaleString()} <span className="text-xs text-gray-400 font-normal">Ks</span>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-800">
                                        {t.transaction_fee > 0 ? `${t.transaction_fee.toLocaleString()} Ks` : '-'}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-gray-800">
                                        {t.payment_categories?.name || <Translate tKey="history.unknown" />}
                                    </td>
                                    <td className="p-4 text-sm text-gray-800 font-medium">
                                        {t.customer_name || '-'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-700 font-mono">
                                        {t.phone_number || '-'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">
                                        {t.note || '-'}
                                    </td>
                                </tr>
                            ))}

                            {(!transactions || transactions.length === 0) && (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-gray-500 border-t border-gray-100">
                                        <Translate tKey="history.noTransactions" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {transactions?.map((t) => (
                        <div key={t.id} className="p-4 hover:bg-gray-50 flex flex-col space-y-3 transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {t.type === 'IN' ? (
                                        <span className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">
                                            <ArrowDownRight className="w-3 h-3 mr-1" /> IN
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-bold">
                                            <ArrowUpRight className="w-3 h-3 mr-1" /> OUT
                                        </span>
                                    )}
                                    <span className="text-sm font-medium text-gray-800 ml-1">
                                        {t.payment_categories?.name || <Translate tKey="history.unknown" />}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{format(new Date(t.created_at), 'hh:mm a')}</span>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    {t.customer_name && <p className="text-sm font-bold text-gray-900 mb-1">{t.customer_name}</p>}
                                    <p className="text-sm text-gray-700 font-mono mb-1">{t.phone_number || '-'}</p>
                                    <p className="text-xs text-gray-500 max-w-[200px] truncate">{t.note || '-'}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-lg font-bold ${t.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                                        {t.type === 'OUT' ? '-' : '+'}{t.amount.toLocaleString()} <span className="text-xs font-normal">Ks</span>
                                    </p>
                                    {t.transaction_fee > 0 && <p className="text-xs text-blue-600 font-semibold mt-0.5">+ {t.transaction_fee.toLocaleString()} Ks Fee</p>}
                                </div>
                            </div>
                        </div>
                    ))}

                    {(!transactions || transactions.length === 0) && (
                        <div className="p-8 text-center text-gray-500">
                            <Translate tKey="history.noTransactions" />
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
