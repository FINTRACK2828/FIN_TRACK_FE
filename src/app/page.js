'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import DashboardOverview from '@/components/DashboardOverview';
import TransactionsView from '@/components/TransactionsView';
import TransactionModal from '@/components/TransactionModal';
import BudgetsView from '@/components/BudgetsView';
import SavingsGoalsView from '@/components/SavingsGoalsView';
import RecurringBillsView from '@/components/RecurringBillsView';
import ReportsView from '@/components/ReportsView';
import SettingsView from '@/components/SettingsView';
import AuthModal from '@/components/AuthModal';
import { StorageService } from '@/lib/storage';
import { FinanceService } from '@/lib/api';
import { formatINR, getRelativeDueDate } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Sparkles, IndianRupee } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core App State (User-Scoped)
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [recurringBills, setRecurringBills] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [categories, setCategories] = useState([]);
  const [loadError, setLoadError] = useState('');

  // Modals & UI Controls
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const applyData = (data) => {
    setUser(data.user);
    StorageService.setSessionUser(data.user);
    setCategories(data.categories);
    setTransactions(data.transactions);
    setBudgets(data.budgets);
    setSavingsGoals(data.savingsGoals);
    setRecurringBills(data.recurringBills);
    setMonthlyData(data.monthlyData);
  };

  useEffect(() => {
    let cancelled = false;
    const expired = () => router.replace('/login');
    window.addEventListener('fintrack-session-expired', expired);
    const load = async () => {
      if (!StorageService.getSessionUser()) { router.replace('/login'); return; }
      try {
        const data = await FinanceService.load();
        if (!cancelled) { applyData(data); setMounted(true); }
      } catch (error) { if (!cancelled) setLoadError(error.message); }
    };
    void load();
    return () => { cancelled = true; window.removeEventListener('fintrack-session-expired', expired); };
  }, [router]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };
  const mutate = async (operation, message) => {
    try {
      await operation();
      applyData(await FinanceService.load());
      showToast(message);
      return true;
    } catch (error) {
      showToast(error.message, 'error');
      return false;
    }
  };
  const handleLogout = () => { StorageService.logout(); router.replace('/login'); };
  const handleSwitchUser = async (nextUser) => {
    StorageService.setSessionUser(nextUser);
    setMounted(false);
    setLoadError('');
    try { applyData(await FinanceService.load()); setMounted(true); }
    catch (error) { setLoadError(error.message); }
  };
  const handleSaveTransaction = t => mutate(() => FinanceService.saveTransaction(t, transactions.some(existing => existing.id === t.id)), 'Transaction saved');
  const handleDeleteTransaction = id => mutate(() => FinanceService.remove('transactions', id), 'Transaction deleted');
  const handleUpdateBudget = b => mutate(() => FinanceService.saveBudget(b, true), 'Budget updated');
  const handleAddBudget = b => mutate(() => FinanceService.saveBudget(b, false), 'Budget created');
  const handleAddGoal = g => mutate(() => FinanceService.addGoal(g), 'Savings goal created');
  const handleDeleteGoal = id => mutate(() => FinanceService.remove('goals', id), 'Savings goal deleted');
  const handleContributeFunds = (id, amount) => mutate(() => FinanceService.contribute(id, amount), 'Contribution saved');
  const handleAddRecurringBill = b => mutate(() => FinanceService.saveRecurring(b, false), 'Recurring bill created');
  const handleToggleBillStatus = id => {
    const bill = recurringBills.find(b => b.id === id);
    return mutate(() => FinanceService.saveRecurring({ ...bill, active: !bill.active }, true), bill.active ? 'Recurring bill paused' : 'Recurring bill resumed');
  };
  const handleDeleteRecurringBill = id => mutate(() => FinanceService.remove('recurring', id), 'Recurring bill deleted');
  const handleUpdateUser = updatedUser => mutate(() => FinanceService.updateUser(updatedUser), 'Profile saved');
  const handleResetData = () => mutate(async () => {}, 'Data refreshed');

  // Derive Dynamic Alerts & Notifications
  const notifications = useMemo(() => {
    if (!mounted) return [];
    const alerts = [];

    // 1. Upcoming due bills (within 4 days)
    recurringBills.forEach((bill) => {
      if (bill.active) {
        const rel = getRelativeDueDate(bill.dueDate);
        if (rel.status === 'due-soon' || rel.status === 'due-today' || rel.status === 'overdue') {
          alerts.push({
            type: rel.status === 'overdue' ? 'warning' : 'due',
            title: `${bill.title} (${formatINR(bill.amount)})`,
            desc: `${rel.text} • Provider: ${bill.provider}`,
            actionTab: 'recurring',
          });
        }
      }
    });

    // 2. Budget limits near threshold or exceeded
    const spentByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
        return acc;
      }, {});

    budgets.forEach((b) => {
      const spent = b.spent;
      if (spent > b.allocated) {
        alerts.push({
          type: 'warning',
          title: `Budget Exceeded: ${b.category}`,
          desc: `Spent ${formatINR(spent)} vs limit of ${formatINR(b.allocated)}`,
          actionTab: 'budgets',
        });
      } else if (b.allocated > 0 && spent / b.allocated >= 0.85) {
        alerts.push({
          type: 'warning',
          title: `Budget Alert: ${b.category}`,
          desc: `At ${Math.round((spent / b.allocated) * 100)}% of monthly capacity`,
          actionTab: 'budgets',
        });
      }
    });

    return alerts;
  }, [mounted, recurringBills, budgets, transactions]);

  const upcomingBillsCount = mounted
    ? recurringBills.filter(
        (b) => b.active && getRelativeDueDate(b.dueDate).status !== 'normal'
      ).length
    : 0;

  const overBudgetsCount = mounted
    ? budgets.filter((b) => {
        const spent = b.spent;
        return spent > b.allocated;
      }).length
    : 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 animate-spin flex items-center justify-center shadow-xl shadow-emerald-500/20">
            <IndianRupee className="w-6 h-6 text-white stroke-[2.5]" />
          </div>
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            {loadError || 'Loading your financial data...'}
          </p>
          {loadError && <div className="flex gap-4">
            <button onClick={() => window.location.reload()}>Retry</button>
            <button onClick={handleLogout}>Back to login</button>
          </div>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-fade-in text-xs sm:text-sm font-semibold">
          {toastMessage.type === 'error' ? (<AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />) : toastMessage.type === 'info' ? (
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Dark Navy Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTxModalOpen(true);
        }}
        user={user}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        upcomingBillsCount={upcomingBillsCount}
        overBudgetsCount={overBudgetsCount}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          currentTab={activeTab}
          onOpenNewTransaction={() => {
            setEditingTransaction(null);
            setIsTxModalOpen(true);
          }}
          user={user}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onNavigateTab={(tab) => setActiveTab(tab)}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              user={user}
              transactions={transactions}
              budgets={budgets}
              savingsGoals={savingsGoals}
              recurringBills={recurringBills}
              monthlyData={monthlyData}
              onOpenNewTransaction={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onQuickContributeGoal={(goal) => {
                setActiveTab('savings');
              }}
              onQuickPayBill={(bill) => {
                handleToggleBillStatus(bill.id);
              }}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              categories={categories}
              transactions={transactions}
              onOpenNewTransaction={() => {
                setEditingTransaction(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
        categories={categories}
              budgets={budgets}
              transactions={transactions}
              onUpdateBudget={handleUpdateBudget}
              onAddBudget={handleAddBudget}
            />
          )}

          {activeTab === 'savings' && (
            <SavingsGoalsView
              savingsGoals={savingsGoals}
              onAddGoal={handleAddGoal}
              onDeleteGoal={handleDeleteGoal}
              onContributeFunds={handleContributeFunds}
            />
          )}

          {activeTab === 'recurring' && (
            <RecurringBillsView
        categories={categories}
              recurringBills={recurringBills}
              onAddRecurringBill={handleAddRecurringBill}
              onToggleBillStatus={handleToggleBillStatus}
              onDeleteRecurringBill={handleDeleteRecurringBill}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              transactions={transactions}
              monthlyData={monthlyData}
              user={user}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              user={user}
              onUpdateUser={handleUpdateUser}
              onResetData={handleResetData}
              onOpenAuthModal={() => setIsAuthModalOpen(true)}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        categories={categories}
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      {/* Auth / Switch Demo User Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        onLoginSuccess={handleSwitchUser}
      />
    </div>
  );
}
