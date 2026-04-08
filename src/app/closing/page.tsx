import { createClient } from '@/utils/supabase/server';
import { closeDay } from './actions';
import { getYangonTodayString, getYangonDayRange, formatYangonDate, formatYangonTime } from '@/lib/utils/time';
import { Lock, FileCheck2, User, CheckCircle2, AlertTriangle } from 'lucide-react';

export default async function ClosingPage(props: { searchParams: Promise<{ error?: string }> }) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    const todayStr = getYangonTodayString();
    const { start: startISO, end: endISO } = getYangonDayRange(todayStr);

    // 1. Check if today is already closed
    const { data: todayClosing } = await supabase
        .from('daily_closings')
        .select('*, profiles(full_name)')
        .eq('date', todayStr)
        .maybeSingle();

    // 2. Fetch today's transactions for summary
    const { data: transactions } = await supabase
        .from('transactions')
        .select('type, amount')
        .gte('created_at', startISO)
        .lte('created_at', endISO);

    let totalIn = 0;
    let totalOut = 0;
    transactions?.forEach(t => {
        if (t.type === 'IN') totalIn += Number(t.amount);
        if (t.type === 'OUT') totalOut += Number(t.amount);
    });

    const netBalance = totalIn - totalOut;

    // 3. Fetch past closings
    const { data: pastClosings } = await supabase
        .from('daily_closings')
        .select('*, profiles(full_name)')
        .order('date', { ascending: false })
        .limit(10);

    return (
        <div className="max-w-4xl mx-auto space-y-8">

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Lock className="w-8 h-8 text-blue-600" />
                        End of Day Closing
                    </h1>
                    <p className="text-gray-500 mt-1">Review today's transactions and lock records</p>
                </div>
            </div>

            {searchParams.error && (
                <div className="p-4 bg-red-50 text-red-700 flex items-center gap-2 rounded-xl border border-red-100">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{searchParams.error}</span>
                </div>
            )}

            {/* Today's Closing Status */}
            {todayClosing ? (
                <div className="bg-green-50 p-8 rounded-2xl shadow-sm border border-green-200 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-green-900 mb-2">Today is Closed</h2>
                    <p className="text-green-800 mb-4">
                        Transactions for {formatYangonDate(todayClosing.date)} have been finalized.
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-green-100 shadow-sm text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Closed by <span className="font-semibold">{todayClosing.profiles?.full_name || 'Staff'}</span> at {formatYangonTime(todayClosing.created_at)}</span>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Summary for {formatYangonDate(new Date())}</h2>
                        <p className="text-gray-500">Please verify the totals against your physical cash and digital wallets before closing.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                            <span className="text-sm font-semibold text-gray-500 uppercase">Total IN</span>
                            <p className="text-2xl font-bold text-green-600 mt-1">{totalIn.toLocaleString()} <span className="text-xs">Ks</span></p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                            <span className="text-sm font-semibold text-gray-500 uppercase">Total OUT</span>
                            <p className="text-2xl font-bold text-red-600 mt-1">{totalOut.toLocaleString()} <span className="text-xs">Ks</span></p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 text-center">
                            <span className="text-sm font-semibold text-blue-800 uppercase">Net Balance</span>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{netBalance > 0 ? '+' : ''}{netBalance.toLocaleString()} <span className="text-xs">Ks</span></p>
                        </div>
                    </div>

                    <form action={closeDay} className="flex justify-end">
                        <input type="hidden" name="date" value={todayStr} />
                        <input type="hidden" name="totalIn" value={totalIn} />
                        <input type="hidden" name="totalOut" value={totalOut} />

                        <button
                            type="submit"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-200 flex items-center space-x-2"
                        >
                            <Lock className="w-5 h-5" />
                            <span>Confirm & Close Day</span>
                        </button>
                    </form>
                </div>
            )}

            {/* Past Closings History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-gray-500" />
                    <h2 className="text-lg font-bold text-gray-800">Past Closings</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Total IN</th>
                                <th className="p-4 font-semibold">Total OUT</th>
                                <th className="p-4 font-semibold">Net</th>
                                <th className="p-4 font-semibold">Closed By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pastClosings?.map((c) => (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm font-medium text-gray-900">
                                        {formatYangonDate(c.date)}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-green-600">
                                        +{Number(c.total_in).toLocaleString()} Ks
                                    </td>
                                    <td className="p-4 text-sm font-medium text-red-600">
                                        -{Number(c.total_out).toLocaleString()} Ks
                                    </td>
                                    <td className="p-4 text-sm font-bold text-blue-900">
                                        {(Number(c.total_in) - Number(c.total_out)).toLocaleString()} Ks
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 flex items-center gap-1">
                                        <User className="w-3 h-3 text-gray-400" />
                                        <span>{c.profiles?.full_name || 'Staff'}</span>
                                    </td>
                                </tr>
                            ))}
                            {(!pastClosings || pastClosings.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No past closing records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
