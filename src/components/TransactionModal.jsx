'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Check, IndianRupee } from 'lucide-react';


export default function TransactionModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  categories = [],
}) {
  if (!isOpen) return null;

  return (
    <TransactionModalDialog
      key={initialData?.id || 'new-tx'}
      categories={categories}
      onClose={onClose}
      onSave={onSave}
      initialData={initialData}
    />
  );
}

function TransactionModalDialog({ onClose, onSave, initialData, categories }) {
  const INCOME_CATEGORIES = categories.filter(c => c.type === 'income').map(c => c.name);
  const EXPENSE_CATEGORIES = categories.filter(c => c.type === 'expense').map(c => c.name);
  const [formData, setFormData] = useState(() => ({
    title: initialData?.title || '',
    amount: initialData?.amount || '',
    type: initialData?.type || 'expense',
    category: initialData?.category || (initialData?.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
    date: initialData?.date || (typeof window !== 'undefined' ? new Date().toISOString().split('T')[0] : '2026-10-11'),
  }));

  const [errors, setErrors] = useState({});

  const currentCategories =
    formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type) => {
    const defaultCat = type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0];
    setFormData((prev) => ({
      ...prev,
      type,
      category: defaultCat,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title / Description is required';
    if (!formData.amount || Number(formData.amount) <= 0)
      errs.amount = 'Valid amount in ₹ is required';
    if (!formData.date) errs.date = 'Date is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const saved = await onSave({
      ...formData,
      amount: Number(formData.amount),
      id: initialData?.id || `tx-${Date.now()}`,
      status: 'Completed',
    });
    if (saved) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">
              {initialData ? 'Edit Transaction' : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-slate-500">
              {initialData ? 'Update transaction details' : 'Add income or expense to your accounts'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Expense (-)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Income (+)
              </button>
            </div>
          </div>

          {/* Amount in INR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ₹
              </span>
              <input
                type="number" step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className={`w-full pl-9 pr-4 py-2.5 text-base font-bold bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 tabular-nums ${
                  errors.amount ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                }`}
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy Gourmet, TechCorp Salary, BESCOM Bill"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 ${
                errors.title ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
              }`}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {currentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>


          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {errors.date && <p className="text-xs text-rose-500 mt-1">{errors.date}</p>}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {initialData ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
