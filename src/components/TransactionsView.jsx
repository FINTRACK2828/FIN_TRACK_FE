'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { formatINR, formatDate, getCategoryStyle } from '@/lib/utils';

export default function TransactionsView({
  transactions = [],
  categories = [],
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  searchQuery = '',
  setSearchQuery,
}) {
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'income', 'expense'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'amount-desc', 'amount-asc'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const allCategories = useMemo(() => {
    return Array.from(new Set(categories.map(c => c.name)));
  }, [categories]);

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((tx) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesCategory = tx.category.toLowerCase().includes(q);
          const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(q) : false;
          const matchesMethod = tx.paymentMethod ? tx.paymentMethod.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesCategory && !matchesNotes && !matchesMethod) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== 'all' && tx.type !== selectedType) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount);
        if (sortBy === 'amount-asc') return Number(a.amount) - Number(b.amount);
        return 0;
      });
  }, [transactions, searchQuery, selectedType, selectedCategory, sortBy]);

  // Totals of currently filtered list
  const filteredIncome = filteredTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const filteredExpense = filteredTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // CSV Export functionality
  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Type', 'Title', 'Category', 'Amount (INR)', 'Payment Method', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.date,
      t.type,
      `"${t.title.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMethod}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fintrack_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Ledger Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filtered Inflow
          </p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1 tabular-nums">
            +{formatINR(filteredIncome)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filteredTransactions.filter((t) => t.type === 'income').length} income records
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Filtered Outflow
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            -{formatINR(filteredExpense)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filteredTransactions.filter((t) => t.type === 'expense').length} expense records
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Ledger Cash
          </p>
          <p
            className={`text-xl sm:text-2xl font-bold mt-1 tabular-nums ${
              filteredIncome - filteredExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(filteredIncome - filteredExpense)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total records: {filteredTransactions.length}
          </p>
        </div>
      </div>

      {/* Action / Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, note, category or payment method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {/* Add Transaction CTA */}
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Transaction</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter Buttons */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {['all', 'income', 'expense'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1 rounded-lg font-semibold capitalize transition-all ${
                    selectedType === t
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium hidden sm:inline">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {allCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No transactions found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, type filter, or add a new transaction to this ledger.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all"
            >
              + Create First Transaction
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Transaction</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Date</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const catStyle = getCategoryStyle(tx.category);

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Title & Icon */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                            }`}
                          >
                            {isIncome ? (
                              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{tx.title}</p>
                            {tx.notes && (
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                {tx.notes}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 sm:hidden mt-0.5">
                              {formatDate(tx.date)} • {tx.paymentMethod}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${catStyle.bg}`}
                        >
                          {tx.category}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-slate-600">
                        {formatDate(tx.date)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-slate-500 font-medium">
                        {tx.paymentMethod}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-bold tabular-nums text-sm sm:text-base ${
                            isIncome ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatINR(tx.amount)}
                        </span>
                      </td>

                      {/* Action buttons (Edit / Delete) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditTransaction(tx)}
                            title="Edit Transaction"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <button
                                onClick={() => {
                                  onDeleteTransaction(tx.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="text-[11px] text-slate-600 px-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
                              title="Delete Transaction"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
