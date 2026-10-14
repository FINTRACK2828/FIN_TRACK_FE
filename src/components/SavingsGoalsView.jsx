'use client';

import React, { useState } from 'react';
import {
  Target,
  Plus,
  ShieldCheck,
  CarFront,
  Plane,
  Coins,
  Calendar,
  X,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Trash2,
  Edit2,
  IndianRupee,
} from 'lucide-react';
import { formatINR, formatDate } from '@/lib/utils';

const GOAL_ICONS = {
  Emergency: ShieldCheck,
  Vehicle: CarFront,
  Travel: Plane,
  Investment: Coins,
  Other: Target,
};

export default function SavingsGoalsView({
  savingsGoals = [],
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onContributeFunds,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    category: 'Emergency',
    notes: '',
  });

  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const overallSavedPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenContribute = (goal) => {
    setContributeGoal(goal);
    setDepositAmount('');
  };

  const handleDepositSubmit = (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0 || !contributeGoal) return;
    onContributeFunds(contributeGoal.id, Number(depositAmount));
    setContributeGoal(null);
    setDepositAmount('');
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoalForm.title || !newGoalForm.targetAmount) return;

    onAddGoal({
      id: `sg-${Date.now()}`,
      title: newGoalForm.title,
      targetAmount: Number(newGoalForm.targetAmount),
      currentAmount: Number(newGoalForm.currentAmount || 0),
      deadline: newGoalForm.deadline || '2027-12-31',
      category: newGoalForm.category,
      notes: newGoalForm.notes || '',
      color: 'emerald',
    });

    setNewGoalForm({
      title: '',
      targetAmount: '',
      currentAmount: '',
      deadline: '',
      category: 'Emergency',
      notes: '',
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Goals Hero Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-[#0B132B] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wealth Accumulation Milestones</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Savings Goals Tracker
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              You have secured <strong className="text-white">{formatINR(totalSaved)}</strong> out of your{' '}
              {formatINR(totalTarget)} target portfolio ({overallSavedPercent}% achieved).
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Goal</span>
          </button>
        </div>

        {/* Global Progress Bar in Hero */}
        <div className="mt-6 pt-6 border-t border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-300">Total Portfolio Savings Progress</span>
            <span className="font-bold text-emerald-400 tabular-nums">{overallSavedPercent}% Complete</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${overallSavedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {savingsGoals.map((goal) => {
          const percent = goal.targetAmount > 0
            ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
            : 0;
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const Icon = GOAL_ICONS[goal.category] || GOAL_ICONS.Other;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {goal.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Target: {formatDate(goal.deadline)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Remove Goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {goal.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 line-clamp-2">
                    {goal.notes}
                  </p>
                )}

                {/* Progress Stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400">Current Saved: </span>
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {formatINR(goal.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400">Target: </span>
                      <span className="text-xs font-bold text-slate-700 tabular-nums">
                        {formatINR(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                    <span>
                      Remaining: <strong className="text-slate-800">{formatINR(remaining)}</strong>
                    </span>
                    <span className="font-bold text-emerald-600">{percent}%</span>
                  </div>
                </div>
              </div>

              {/* Action: Add Funds button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {goal.category}
                </span>

                <button
                  onClick={() => handleOpenContribute(goal)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200/80 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Contribute Funds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contribute Funds Modal */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Contribute to Goal</h3>
                <p className="text-xs text-slate-400 truncate max-w-[200px]">{contributeGoal.title}</p>
              </div>
              <button
                onClick={() => setContributeGoal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="e.g. 5000"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex items-center gap-2">
                {[5000, 10000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDepositAmount(amt.toString())}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 transition-colors"
                  >
                    +{formatINR(amt)}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Add to Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Create New Savings Goal</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Goal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home Down Payment, Paris Vacation"
                  value={newGoalForm.title}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                  className="w-full px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target (₹) *
                  </label>
                  <input
                    type="number"
                    min="1000"
                    placeholder="300000"
                    value={newGoalForm.targetAmount}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newGoalForm.currentAmount}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, currentAmount: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={newGoalForm.category}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  >
                    <option value="Emergency">Emergency</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Travel">Travel</option>
                    <option value="Investment">Investment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoalForm.deadline}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, deadline: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notes / Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details or target accounts..."
                  value={newGoalForm.notes}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
