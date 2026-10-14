'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Plus,
  Bell,
  IndianRupee,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function Navbar({
  onToggleMobile,
  currentTab,
  onOpenNewTransaction,
  user,
  onOpenAuthModal,
  searchQuery,
  setSearchQuery,
  notifications = [],
  onNavigateTab,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return { title: 'Financial Overview', desc: 'Real-time summary of your finances' };
      case 'transactions':
        return { title: 'Transactions Ledger', desc: 'Manage your income & expense history' };
      case 'budgets':
        return { title: 'Budget Management', desc: 'Track spending against category allocations' };
      case 'savings':
        return { title: 'Savings Goals', desc: 'Target milestones and progress tracking' };
      case 'recurring':
        return { title: 'Recurring Bills & Subscriptions', desc: 'Never miss an upcoming payment deadline' };
      case 'reports':
        return { title: 'Reports & Analytics', desc: 'Deep dive into cashflow and spending trends' };
      case 'settings':
        return { title: 'Account Settings', desc: 'Manage preferences, profile & demo data' };
      default:
        return { title: 'FINTRACK Dashboard', desc: 'Personal finance system' };
    }
  };

  const currentInfo = getTabTitle();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {currentInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>
        </div>

        {/* Center: Search Input */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions, bills, categories..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick CTA, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Button */}
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-xs sm:text-sm rounded-xl shadow-xs shadow-emerald-600/30 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Currency Pill */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>INR (₹)</span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors relative cursor-pointer"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fade-in">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800 text-sm">Notifications & Alerts</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {notifications.length} New
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No pending alerts. All accounts in optimal standing!
                    </div>
                  ) : (
                    notifications.map((notif, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          if (notif.actionTab) {
                            onNavigateTab(notif.actionTab);
                            setShowNotifications(false);
                          }
                        }}
                        className="p-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3"
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            notif.type === 'warning'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : notif.type === 'due'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}
                        >
                          {notif.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : notif.type === 'due' ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-snug">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{notif.desc}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigateTab('recurring');
                      setShowNotifications(false);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View Recurring Schedule →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
            title="Profile & Demo Credentials"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.avatar || (user?.name ? user.name[0].toUpperCase() : 'U')}
            </div>
            <span className="text-xs font-semibold text-slate-800 hidden md:inline">
              {user?.name?.split(' ')[0] || 'Member'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
