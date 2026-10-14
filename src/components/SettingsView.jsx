'use client';

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  RotateCcw,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  IndianRupee,
  Smartphone,
  Mail,
  MapPin,
  Sparkles,
  LogOut,
} from 'lucide-react';

export default function SettingsView({
  user,
  onUpdateUser,
  onResetData,
  onOpenAuthModal,
  onLogout,
}) {
  const [formData, setFormData] = useState({
    name: user?.name || 'Rahul Sharma',
    email: user?.email || 'rahul.sharma@fintrack.in',
    phone: user?.phone || '+91 98765 43210',
    city: user?.city || 'Bengaluru, Karnataka',
    currency: 'INR (₹)',
    financialYearStart: user?.financialYearStart || 'April',
    billAlerts: user?.notifications?.billAlerts ?? true,
    budgetWarnings: user?.notifications?.budgetWarnings ?? true,
    weeklyReport: user?.notifications?.weeklyReport ?? true,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      avatar: formData.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      notifications: {
        billAlerts: formData.billAlerts,
        budgetWarnings: formData.budgetWarnings,
        weeklyReport: formData.weeklyReport,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Customize your profile, notification thresholds, and demo environment
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">User Profile Details</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Switch Account
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Calendar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Currency & Fiscal Localization</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Base Currency
              </label>
              <input
                type="text"
                value="INR - Indian Rupee (₹)"
                disabled
                className="w-full px-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">Formatted in Lakhs/Crores numbering standard.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Financial Year Commencement
              </label>
              <select
                value={formData.financialYearStart}
                onChange={(e) => setFormData({ ...formData, financialYearStart: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
              >
                <option value="April">April (Indian Standard: Apr - Mar)</option>
                <option value="January">January (Calendar Year: Jan - Dec)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications & Alert Preferences */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Alerts & Notifications</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Recurring Bill Reminders
                </p>
                <p className="text-[11px] text-slate-500">
                  Notify 3 days before upcoming utility, insurance, and subscription deadlines.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.billAlerts}
                onChange={(e) => setFormData({ ...formData, billAlerts: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Category Budget Threshold Warnings
                </p>
                <p className="text-[11px] text-slate-500">
                  Trigger alerts when any expense category reaches 80% or exceeds its limit.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.budgetWarnings}
                onChange={(e) => setFormData({ ...formData, budgetWarnings: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer">
              <div>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Weekly Savings & Spending Summary
                </p>
                <p className="text-[11px] text-slate-500">
                  Receive cash flow performance scorecard every Monday morning.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.weeklyReport}
                onChange={(e) => setFormData({ ...formData, weeklyReport: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
              />
            </label>
          </div>
        </div>

        {/* Save button banner */}
        <div className="flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                Settings saved successfully!
              </span>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone / Demo Data Reset */}
      <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2 text-rose-700">
          <RotateCcw className="w-4 h-4" />
          <h3 className="font-bold text-base">Demo Environment & Factory Reset</h3>
        </div>
        <p className="text-xs text-slate-600 mb-4 max-w-xl">
          Reset all transactions, budgets, savings goals, and bills back to the initial demo state in localStorage. Perfect for test presentations.
        </p>

        {resetConfirm ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onResetData();
                setResetConfirm(false);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Yes, Reset Everything Now
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-4 py-2 bg-white border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Reset All Data to Default Demo Data
          </button>
        )}
      </div>
    </div>
  );
}
