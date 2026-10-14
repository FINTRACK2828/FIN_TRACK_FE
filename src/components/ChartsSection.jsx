'use client';

import React, { useState, useSyncExternalStore } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { formatINR } from '@/lib/utils';
import { TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// Custom tooltip components defined outside to avoid recreation during render
function CustomBarTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
        <p className="font-bold text-slate-300 mb-1.5">{label} 2026</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 capitalize">{entry.name}:</span>
            </span>
            <span className="font-bold tabular-nums text-white">{formatINR(entry.value)}</span>
          </div>
        ))}
        {payload.length >= 2 && (
          <div className="mt-1.5 pt-1.5 border-t border-slate-700 flex justify-between text-emerald-400 font-semibold">
            <span>Net Savings:</span>
            <span>{formatINR(payload[0].value - payload[1].value)}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload, totalExpenseComputed }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = totalExpenseComputed > 0
      ? ((data.value / totalExpenseComputed) * 100).toFixed(1)
      : 0;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
        <p className="font-bold text-slate-200">{data.name}</p>
        <div className="mt-1 flex items-center justify-between gap-4">
          <span className="text-slate-400">Total Spent:</span>
          <span className="font-bold text-emerald-400">{formatINR(data.value)}</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <span className="text-slate-400">Share of Expenses:</span>
          <span className="font-bold text-white">{percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function ChartsSection({ monthlyData = [], transactions = [] }) {
  const mounted = useIsMounted();
  const [chartView, setChartView] = useState('bar'); // 'bar' or 'area'

  // Compute category expense breakdown from transactions
  const expenseByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

  const pieColors = [
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#F97316', // Orange
    '#64748B', // Slate
  ];

  const pieData = Object.keys(expenseByCategory).map((cat, idx) => ({
    name: cat,
    value: expenseByCategory[cat],
    color: pieColors[idx % pieColors.length],
  }));

  const totalExpenseComputed = pieData.reduce((sum, item) => sum + item.value, 0);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 h-[380px] animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading Financial Analytics Charts...
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 h-[380px] animate-pulse flex items-center justify-center text-slate-400 text-sm">
          Loading Breakdown...
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Monthly Cash Flow / Income vs Expense */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Cash Flow Comparison
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Monthly Income vs Expense trend (INR ₹)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                chartView === 'bar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Bar View
            </button>
            <button
              onClick={() => setChartView('area')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                chartView === 'area'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Trend Area
            </button>
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'bar' ? (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar
                  name="Income"
                  dataKey="income"
                  fill="#10B981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  name="Expense"
                  dataKey="expense"
                  fill="#64748B"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            ) : (
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  name="Income"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeGrad)"
                />
                <Area
                  type="monotone"
                  name="Expense"
                  dataKey="expense"
                  stroke="#F43F5E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Category Breakdown Donut Chart */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">
              Expense Distribution
            </h3>
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            By Category
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Total Month Spent: <span className="font-semibold text-slate-800">{formatINR(totalExpenseComputed)}</span>
        </p>

        <div className="h-[200px] w-full relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip totalExpenseComputed={totalExpenseComputed} />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Donut Center text */}
          <div className="absolute text-center pointer-events-none">
            <p className="text-[11px] text-slate-400 font-medium">Top Category</p>
            <p className="text-xs font-bold text-slate-800 truncate max-w-[90px]">
              {pieData[0]?.name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Legend List */}
        <div className="mt-3 flex-1 overflow-y-auto max-h-[110px] space-y-1.5 pr-1">
          {pieData.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatINR(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
