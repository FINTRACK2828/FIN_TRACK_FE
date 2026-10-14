'use client';

import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  CreditCard,
  Target,
  PieChart as PieIcon,
  IndianRupee,
} from 'lucide-react';
import { formatINR, formatDate, getCategoryStyle, getRelativeDueDate } from '@/lib/utils';
import ChartsSection from './ChartsSection';

export default function DashboardOverview({
  user,
  transactions = [],
  budgets = [],
  savingsGoals = [],
  recurringBills = [],
  monthlyData = [],
  onOpenNewTransaction,
  onNavigateTab,
  onQuickContributeGoal,
  onQuickPayBill,
}) {
  // Compute real-time totals from current transactions
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;
  
  // Base bank balance + net savings
  const totalLiquidBalance = 363348 + netSavings;

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Upcoming bills (filter out paid ones)
  const upcomingBills = recurringBills
    .filter((b) => b.status !== 'Paid')
    .slice(0, 3);

  // Top 3 savings goals
  const topGoals = savingsGoals.slice(0, 3);

  const displayName = user?.name ? user.name.split(' ')[0] : 'Member';

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-[#0B132B] via-slate-900 to-[#1C2541] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-16 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Oct 2026 Financial Health: Excellent</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, <span className="text-emerald-400">{displayName}!</span>
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
              You&apos;ve saved <strong className="text-white">{formatINR(netSavings)}</strong> this month ({savingsRate}% savings rate).
              Keep up the momentum towards your wealth goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-medium text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>View Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Net Worth / Balance */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Balance
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatINR(totalLiquidBalance)}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14.2%
            </span>
            <span className="text-slate-400">vs last month</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Monthly Income
            </span>
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums text-emerald-600">
              {formatINR(totalIncome)}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +8.5%
            </span>
            <span className="text-slate-400">TechCorp + Freelance</span>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatINR(totalExpense)}
            </h3>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" />
              -6.8%
            </span>
            <span className="text-slate-400">Within monthly budget</span>
          </div>
        </div>

        {/* Total Monthly Savings */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Savings Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {savingsRate}%
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              ({formatINR(netSavings)})
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="inline-flex items-center text-emerald-600 font-semibold gap-0.5">
              Target: 50%
            </span>
            <span className="text-emerald-600 font-bold">Ahead by +{savingsRate - 50}%</span>
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <ChartsSection monthlyData={monthlyData} transactions={transactions} />

      {/* Two Column Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500">
                Latest financial activities from your accounts
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => {
              const catStyle = getCategoryStyle(tx.category);
              const isIncome = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 -mx-2 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-rose-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catStyle.bg}`}
                        >
                          {tx.category}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {formatDate(tx.date)}
                        </span>
                        <span className="text-[11px] text-slate-400 hidden md:inline truncate">
                          • {tx.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p
                      className={`text-xs sm:text-sm font-bold tabular-nums ${
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatINR(tx.amount)}
                    </p>
                    <span className="text-[10px] text-slate-400 capitalize block sm:hidden">
                      {formatDate(tx.date)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Savings Goals & Upcoming Recurring Bills */}
        <div className="space-y-6">
          {/* Savings Goals Widget */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Savings Goals
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('savings')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Manage →
              </button>
            </div>

            <div className="space-y-4">
              {topGoals.map((goal) => {
                const percent = Math.min(
                  100,
                  Math.round((goal.currentAmount / goal.targetAmount) * 100)
                );
                return (
                  <div key={goal.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {goal.title}
                      </span>
                      <span className="text-xs font-bold text-emerald-600 tabular-nums">
                        {percent}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        <strong className="text-slate-700">{formatINR(goal.currentAmount)}</strong> of{' '}
                        {formatINR(goal.targetAmount)}
                      </span>
                      <button
                        onClick={() => onQuickContributeGoal(goal)}
                        className="text-[11px] font-semibold text-emerald-600 hover:underline"
                      >
                        + Add Funds
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Bills Widget */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Upcoming Due Bills
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('recurring')}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                All Bills →
              </button>
            </div>

            <div className="space-y-3">
              {upcomingBills.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  All upcoming bills paid for this cycle!
                </div>
              ) : (
                upcomingBills.map((bill) => {
                  const relative = getRelativeDueDate(bill.dueDate);
                  return (
                    <div
                      key={bill.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {bill.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            {relative.text}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(bill.dueDate)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-900 tabular-nums">
                          {formatINR(bill.amount)}
                        </p>
                        <button
                          onClick={() => onQuickPayBill(bill)}
                          className="mt-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        >
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
