'use client';

import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle,
  Home,
  UtensilsCrossed,
  ShoppingCart,
  ShoppingBag,
  Zap,
  Car,
  HeartPulse,
  Edit2,
  X,
  IndianRupee,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

const ICON_MAP = {
  'Housing & Rent': Home,
  'Food & Dining': UtensilsCrossed,
  'Groceries': ShoppingCart,
  'Shopping': ShoppingBag,
  'Utilities & Bills': Zap,
  'Travel & Commute': Car,
  'Healthcare': HeartPulse,
};

function generateBudgetId() {
  return 'b-' + Date.now();
}

export default function BudgetsView({
  categories = [],
  budgets = [],
  onUpdateBudget,
  onAddBudget,
}) {
  const EXPENSE_CATEGORIES = categories.filter(c => c.type === 'expense').map(c => c.name);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    category: EXPENSE_CATEGORIES[0],
    allocated: '',
  });

  const spentByCategory = Object.fromEntries(budgets.map(b => [b.category, b.spent]));

  // Compute live budget statistics
  const totalAllocated = budgets.reduce((sum, b) => sum + Number(b.allocated), 0);
  const totalSpent = budgets.reduce((sum, b) => {
    const liveSpent = spentByCategory[b.category] !== undefined ? spentByCategory[b.category] : b.spent;
    return sum + liveSpent;
  }, 0);

  const totalRemaining = totalAllocated - totalSpent;
  const overallPercent = totalAllocated > 0 ? Math.min(100, Math.round((totalSpent / totalAllocated) * 100)) : 0;

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setBudgetForm({
      category: EXPENSE_CATEGORIES[0],
      allocated: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      category: budget.category,
      allocated: budget.allocated,
    });
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.allocated || Number(budgetForm.allocated) <= 0) return;

    if (editingBudget) {
      const saved = await onUpdateBudget({
        ...editingBudget,
        allocated: Number(budgetForm.allocated),
      });
      if (!saved) return;
    } else {
      const saved = await onAddBudget({
        id: generateBudgetId(),
        category: budgetForm.category,
        allocated: Number(budgetForm.allocated),
        spent: spentByCategory[budgetForm.category] || 0,
        color: 'emerald',
      });
      if (!saved) return;
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Overview Metric Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Monthly Spending Budgets
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Active plan for October 2026. Keep expenses under control to meet your savings target.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Set New Budget</span>
          </button>
        </div>

        {/* Big Overall Progress Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              Overall Budget Utilization
            </span>
            <span
              className={`text-xs sm:text-sm font-bold tabular-nums ${
                overallPercent > 90 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {overallPercent}% ({formatINR(totalSpent)} / {formatINR(totalAllocated)})
            </span>
          </div>

          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercent > 90
                  ? 'bg-rose-500'
                  : overallPercent > 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${overallPercent}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Remaining capacity:{' '}
              <strong className={totalRemaining >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {formatINR(totalRemaining)}
              </strong>
            </span>
            <span>{budgets.length} Categories Monitored</span>
          </div>
        </div>
      </div>

      {/* Category Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const liveSpent = spentByCategory[b.category] !== undefined ? spentByCategory[b.category] : b.spent;
          const percent = b.allocated > 0 ? Math.round((liveSpent / b.allocated) * 100) : 0;
          const remaining = b.allocated - liveSpent;
          const isOver = remaining < 0;
          const Icon = ICON_MAP[b.category] || PieIcon;

          let statusBadge = (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              {formatINR(remaining)} Left
            </span>
          );

          if (isOver) {
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Over by {formatINR(Math.abs(remaining))}
              </span>
            );
          } else if (percent >= 80) {
            statusBadge = (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Near limit ({percent}%)
              </span>
            );
          }

          return (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">
                        {b.category}
                      </h4>
                      <p className="text-[11px] text-slate-400">Monthly Allocation</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                    title="Edit Budget Limit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="my-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800 tabular-nums">
                      {formatINR(liveSpent)}
                    </span>
                    <span className="text-slate-400 tabular-nums">
                      of {formatINR(b.allocated)}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOver
                          ? 'bg-rose-500'
                          : percent >= 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer status */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {statusBadge}
                <span className="text-slate-400 font-semibold tabular-nums">{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Add / Edit Budget */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {editingBudget ? `Edit ${editingBudget.category} Budget` : 'Set New Category Budget'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
              {!editingBudget && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={budgetForm.category}
                    onChange={(e) => setBudgetForm({ ...budgetForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Allocated Limit (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    ₹
                  </span>
                  <input
                    type="number" step="0.01"
                    min="0.01"
                    placeholder="e.g. 15000"
                    value={budgetForm.allocated}
                    onChange={(e) => setBudgetForm({ ...budgetForm, allocated: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>
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
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
