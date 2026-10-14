'use client';

import React from 'react';
import {
  TrendingUp,
  Download,
  Printer,
  Sparkles,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  IndianRupee,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function ReportsView({
  transactions = [],
  monthlyData = [],
  user,
}) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

  // Average daily spend for October (assuming 31 days)
  const avgDailySpend = (totalExpense / 31).toFixed(0);

  // Group expenses by category
  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a);

  const topSpendingCategory = sortedCategories[0] || ['None', 0];

  // Group income by category
  const incomeByCategory = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header with Print / Export CTA */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Comprehensive Financial Reports
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Audited financial breakdown for <strong>{user?.name || 'Rahul Sharma'}</strong> (FY 2026-27).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Financial Health Core Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Savings Efficiency Rate
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {savingsRate}%
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Benchmark: 30%+ is recommended
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Daily Burn
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {formatINR(avgDailySpend)} / day
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Calculated across current month
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Highest Outflow Area
          </span>
          <p className="text-lg sm:text-xl font-bold text-slate-900 mt-1 truncate">
            {topSpendingCategory[0]}
          </p>
          <p className="text-xs font-bold text-rose-600 mt-1 tabular-nums">
            {formatINR(topSpendingCategory[1])}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Surplus Retained
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 tabular-nums">
            {formatINR(netSavings)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Available for investment SIPs
          </p>
        </div>
      </div>

      {/* Two-Column Breakdown: Inflow Sources vs Outflow Allocations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outflow Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Expense Allocation by Category
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Total: {formatINR(totalExpense)}
            </span>
          </div>

          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => {
              const share = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{category}</span>
                    <span className="text-slate-900 tabular-nums">
                      {formatINR(amount)}{' '}
                      <span className="text-slate-400 font-normal">({share}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-700 rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Inflow Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Income Streams Breakdown
            </h3>
            <span className="text-xs font-bold text-emerald-600">
              Total: {formatINR(totalIncome)}
            </span>
          </div>

          <div className="space-y-3">
            {Object.entries(incomeByCategory).map(([category, amount]) => {
              const share = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(1) : 0;
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{category}</span>
                    <span className="text-emerald-600 tabular-nums">
                      +{formatINR(amount)}{' '}
                      <span className="text-slate-400 font-normal">({share}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Month-over-Month Historical Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-5 sm:p-6">
        <h3 className="font-bold text-slate-900 text-base mb-1">
          Historical Monthly Performance
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Consecutive monthly tracking across the last two quarters
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3">Month</th>
                <th className="py-3 px-3 text-right">Income (₹)</th>
                <th className="py-3 px-3 text-right">Expense (₹)</th>
                <th className="py-3 px-3 text-right">Net Savings (₹)</th>
                <th className="py-3 px-3 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.map((m) => {
                const sRate = m.income > 0 ? Math.round((m.savings / m.income) * 100) : 0;
                return (
                  <tr key={m.month} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-bold text-slate-800">{m.month} 2026</td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600 tabular-nums">
                      +{formatINR(m.income)}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 tabular-nums">
                      -{formatINR(m.expense)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 tabular-nums">
                      {formatINR(m.savings)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold tabular-nums">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs">
                        {sRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
