import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { getYangonTodayString, getYangonDayRange, formatYangonDate } from '@/lib/utils/time';
import { ArrowDownCircle, ArrowUpCircle, PlusCircle, History, TrendingUp } from 'lucide-react';
import { Translate } from '@/components/Translate';

export default async function Dashboard() {
  const supabase = await createClient();

  const todayStr = getYangonTodayString();
  const { start: startISO, end: endISO } = getYangonDayRange(todayStr);

  // Fetch today's transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      type, 
      amount, 
      transaction_fee,
      payment_categories ( name )
    `)
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  // Calculate totals
  let totalIn = 0;
  let totalOut = 0;
  let totalFees = 0;
  const feesByCategory: Record<string, number> = {};

  transactions?.forEach(t => {
    if (t.type === 'IN') totalIn += Number(t.amount);
    if (t.type === 'OUT') totalOut += Number(t.amount);

    if (t.transaction_fee) {
      const fee = Number(t.transaction_fee);
      totalFees += fee;
      const cat: any = Array.isArray(t.payment_categories) ? t.payment_categories[0] : t.payment_categories;
      const catName = cat?.name || 'Unknown';
      feesByCategory[catName] = (feesByCategory[catName] || 0) + fee;
    }
  });

  const netBalance = totalIn - totalOut;

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900"><Translate tKey="dashboard.overview" /></h1>
          <p className="text-gray-500 mt-1">{formatYangonDate(new Date())}</p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/transactions/history"
            className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-200 shadow-sm"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline"><Translate tKey="dashboard.dailyHistory" /></span>
          </Link>
          <Link
            href="/transactions/new"
            className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium"
          >
            <PlusCircle className="w-5 h-5" />
            <span><Translate tKey="transaction.new" /></span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* Total In */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-green-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:transform group-hover:scale-110 transition-transform">
            <ArrowDownCircle className="w-24 h-24 text-green-600" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"><Translate tKey="dashboard.totalIn" /></p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{totalIn.toLocaleString()} <span className="text-sm text-gray-400 font-normal">Ks</span></h2>
          </div>
        </div>

        {/* Total Out */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-red-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:transform group-hover:scale-110 transition-transform">
            <ArrowUpCircle className="w-24 h-24 text-red-600" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"><Translate tKey="dashboard.totalOut" /></p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{totalOut.toLocaleString()} <span className="text-sm text-gray-400 font-normal">Ks</span></h2>
          </div>
        </div>

        {/* Total Fees */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group hover:border-purple-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:transform group-hover:scale-110 transition-transform">
            <PlusCircle className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"><Translate tKey="dashboard.totalFees" /></p>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 text-purple-700">{totalFees.toLocaleString()} <span className="text-sm text-gray-400 font-normal">Ks</span></h2>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-blue-600 rounded-2xl p-5 shadow-lg relative overflow-hidden group transform hover:-translate-y-1 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700 opacity-90 z-0"></div>
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:transform group-hover:scale-110 transition-transform z-0">
            <TrendingUp className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider mb-2"><Translate tKey="dashboard.netFlow" /></p>
            <h2 className="text-3xl font-bold text-white mb-2">
              {netBalance > 0 ? '+' : ''}{netBalance.toLocaleString()} <span className="text-sm text-blue-200 font-normal">Ks</span>
            </h2>
          </div>
        </div>

      </div>

      {/* Fee Breakdown */}
      {totalFees > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Translate tKey="dashboard.feeBreakdown" />
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(feesByCategory).map(([catName, fee]) => (
              <div key={catName} className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex flex-col justify-center">
                <span className="text-sm font-medium text-gray-600 mb-1">{catName}</span>
                <span className="text-xl font-bold text-gray-900">{fee.toLocaleString()} <span className="text-xs font-normal text-gray-400">Ks</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
