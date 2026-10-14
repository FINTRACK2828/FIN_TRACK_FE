'use client';

import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  X,
  CreditCard,
  Zap,
  Repeat,
  IndianRupee,
} from 'lucide-react';
import { formatINR, formatDate, getRelativeDueDate } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/data/mockData';

export default function RecurringBillsView({
  recurringBills = [],
  onAddRecurringBill,
  onToggleBillStatus,
  onDeleteRecurringBill,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    title: '',
    provider: '',
    amount: '',
    billingCycle: 'Monthly',
    dueDate: '',
    category: 'Utilities & Bills',
    autoPay: true,
  });

  const totalMonthlyCommitment = recurringBills.reduce(
    (sum, b) => sum + Number(b.amount),
    0
  );

  const pendingBills = recurringBills.filter((b) => b.status !== 'Paid');
  const paidBills = recurringBills.filter((b) => b.status === 'Paid');

  const pendingAmount = pendingBills.reduce((sum, b) => sum + Number(b.amount), 0);

  const handleCreateBill = (e) => {
    e.preventDefault();
    if (!billForm.title || !billForm.amount || !billForm.dueDate) return;

    onAddRecurringBill({
      id: `rec-${Date.now()}`,
      title: billForm.title,
      provider: billForm.provider || billForm.title,
      amount: Number(billForm.amount),
      billingCycle: billForm.billingCycle,
      dueDate: billForm.dueDate,
      category: billForm.category,
      autoPay: billForm.autoPay,
      status: 'Upcoming',
    });

    setBillForm({
      title: '',
      provider: '',
      amount: '',
      billingCycle: 'Monthly',
      dueDate: '',
      category: 'Utilities & Bills',
      autoPay: true,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Overview Metric Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Repeat className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Monthly Commitments
            </span>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
            {formatINR(totalMonthlyCommitment)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {recurringBills.length} active recurring mandates
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Pending Due This Cycle
            </span>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 tabular-nums">
            {formatINR(pendingAmount)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {pendingBills.length} payments pending settlement
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Settled / Paid
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
            {paidBills.length} Paid
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Auto-debits verified this month
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Recurring Subscriptions & Bills
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track SIP investments, utility bills, OTT subs, and rent cycles.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Recurring Bill</span>
          </button>
        </div>

        {/* Bills List */}
        <div className="divide-y divide-slate-100">
          {recurringBills.map((bill) => {
            const isPaid = bill.status === 'Paid';
            const relative = getRelativeDueDate(bill.dueDate);

            return (
              <div
                key={bill.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 -mx-4 px-4 rounded-xl transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isPaid
                        ? 'bg-emerald-50 text-emerald-600'
                        : relative.status === 'due-soon' || relative.status === 'due-today'
                        ? 'bg-amber-50 text-amber-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isPaid ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug truncate">
                        {bill.title}
                      </h4>
                      {bill.autoPay && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Auto-Pay
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-slate-600 font-medium">{bill.provider}</span>
                      <span>•</span>
                      <span>{bill.billingCycle}</span>
                      <span>•</span>
                      <span>Due: {formatDate(bill.dueDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto">
                  <div className="text-right">
                    <p className="font-extrabold text-slate-900 text-base tabular-nums">
                      {formatINR(bill.amount)}
                    </p>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800'
                          : relative.status === 'due-soon' || relative.status === 'due-today'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {isPaid ? 'Settled for Oct' : relative.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggleBillStatus(bill.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isPaid
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {isPaid ? 'Undo Paid' : 'Mark Paid'}
                    </button>

                    <button
                      onClick={() => onDeleteRecurringBill(bill.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Delete Recurring Bill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Recurring Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add Recurring Payment</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bill / Service Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. JioFiber, Tata AIA Term Insurance, SIP"
                  value={billForm.title}
                  onChange={(e) => setBillForm({ ...billForm, title: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Provider / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Reliance Jio, Groww, HDFC"
                  value={billForm.provider}
                  onChange={(e) => setBillForm({ ...billForm, provider: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1500"
                    value={billForm.amount}
                    onChange={(e) => setBillForm({ ...billForm, amount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={billForm.billingCycle}
                    onChange={(e) => setBillForm({ ...billForm, billingCycle: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Next Due Date *
                  </label>
                  <input
                    type="date"
                    value={billForm.dueDate}
                    onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={billForm.category}
                    onChange={(e) => setBillForm({ ...billForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="autopay"
                  checked={billForm.autoPay}
                  onChange={(e) => setBillForm({ ...billForm, autoPay: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 border-slate-300"
                />
                <label htmlFor="autopay" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Auto-Debit mandate configured on bank/card
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Save Recurring Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
