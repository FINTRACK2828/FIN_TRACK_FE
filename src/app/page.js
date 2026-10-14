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
import {
  INITIAL_USER,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECURRING_BILLS,
  INITIAL_MONTHLY_DATA,
} from '@/data/mockData';
import { formatINR, getRelativeDueDate } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Sparkles, IndianRupee } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Core App State (User-Scoped)
  const [user, setUser] = useState(INITIAL_USER);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [budgets, setBudgets] = useState(INITIAL_BUDGETS);
  const [savingsGoals, setSavingsGoals] = useState(INITIAL_SAVINGS_GOALS);
  const [recurringBills, setRecurringBills] = useState(INITIAL_RECURRING_BILLS);
  const [monthlyData, setMonthlyData] = useState(INITIAL_MONTHLY_DATA);

  // Modals & UI Controls
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Client-side authentication check & User-specific data loading
  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const sessionUser = StorageService.getSessionUser();
      
      // If no user is logged in, redirect to login page
      if (!sessionUser) {
        try {
          router.replace('/login');
        } catch (e) {
          console.error('Router replace error:', e);
        }
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.replace('/login');
          }
        }, 150);
        return;
      }

      setUser(sessionUser);
      setTransactions(StorageService.getUserTransactions(sessionUser.email));
      setBudgets(StorageService.getUserBudgets(sessionUser.email));
      setSavingsGoals(StorageService.getUserSavingsGoals(sessionUser.email));
      setRecurringBills(StorageService.getUserRecurringBills(sessionUser.email));
      setMonthlyData(StorageService.getUserMonthlyData(sessionUser.email));
      setMounted(true);
    });

    return () => cancelAnimationFrame(handle);
  }, [router]);

  // Sync state changes back to LocalStorage
  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogout = () => {
    StorageService.logout();
    showToast('Logged out of session. Redirecting to login...', 'info');
    setTimeout(() => {
      try {
        router.push('/login');
      } catch (e) {
        console.error('Router push error:', e);
      }
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = '/login';
        }
      }, 150);
    }, 400);
  };

  const handleSwitchUser = (nextUser) => {
    StorageService.setSessionUser(nextUser);
    setUser(nextUser);
    setTransactions(StorageService.getUserTransactions(nextUser.email));
    setBudgets(StorageService.getUserBudgets(nextUser.email));
    setSavingsGoals(StorageService.getUserSavingsGoals(nextUser.email));
    setRecurringBills(StorageService.getUserRecurringBills(nextUser.email));
    setMonthlyData(StorageService.getUserMonthlyData(nextUser.email));
    showToast(`Switched account to ${nextUser.name}`);
  };

  const handleSaveTransaction = (transactionData) => {
    let updated;
    const isEdit = transactions.some((t) => t.id === transactionData.id);

    if (isEdit) {
      updated = transactions.map((t) =>
        t.id === transactionData.id ? transactionData : t
      );
      showToast(`Updated transaction "${transactionData.title}"`);
    } else {
      updated = [transactionData, ...transactions];
      showToast(`Recorded new transaction "${transactionData.title}" (+₹${transactionData.amount})`);
    }

    setTransactions(updated);
    StorageService.saveUserTransactions(user.email, updated);
  };

  const handleDeleteTransaction = (id) => {
    const target = transactions.find((t) => t.id === id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    StorageService.saveUserTransactions(user.email, updated);
    showToast(`Removed "${target?.title || 'transaction'}"`, 'info');
  };

  const handleUpdateBudget = (updatedBudget) => {
    const updated = budgets.map((b) =>
      b.id === updatedBudget.id ? updatedBudget : b
    );
    setBudgets(updated);
    StorageService.saveUserBudgets(user.email, updated);
    showToast(`Updated budget for ${updatedBudget.category}`);
  };

  const handleAddBudget = (newBudget) => {
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    StorageService.saveUserBudgets(user.email, updated);
    showToast(`Created budget for ${newBudget.category}`);
  };

  const handleAddGoal = (newGoal) => {
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    StorageService.saveUserSavingsGoals(user.email, updated);
    showToast(`Created savings goal "${newGoal.title}"`);
  };

  const handleDeleteGoal = (goalId) => {
    const updated = savingsGoals.filter((g) => g.id !== goalId);
    setSavingsGoals(updated);
    StorageService.saveUserSavingsGoals(user.email, updated);
    showToast('Savings goal deleted', 'info');
  };

  const handleContributeFunds = (goalId, amount) => {
    const target = savingsGoals.find((g) => g.id === goalId);
    const updated = savingsGoals.map((g) => {
      if (g.id === goalId) {
        return {
          ...g,
          currentAmount: Number(g.currentAmount) + Number(amount),
        };
      }
      return g;
    });

    setSavingsGoals(updated);
    StorageService.saveUserSavingsGoals(user.email, updated);
    showToast(`Added ${formatINR(amount)} to "${target?.title}"!`);
  };

  const handleAddRecurringBill = (newBill) => {
    const updated = [...recurringBills, newBill];
    setRecurringBills(updated);
    StorageService.saveUserRecurringBills(user.email, updated);
    showToast(`Added recurring bill "${newBill.title}"`);
  };

  const handleToggleBillStatus = (billId) => {
    const target = recurringBills.find((b) => b.id === billId);
    const newStatus = target?.status === 'Paid' ? 'Upcoming' : 'Paid';

    const updated = recurringBills.map((b) =>
      b.id === billId ? { ...b, status: newStatus } : b
    );

    setRecurringBills(updated);
    StorageService.saveUserRecurringBills(user.email, updated);

    if (newStatus === 'Paid') {
      showToast(`Marked "${target?.title}" as Paid for this cycle!`);
    } else {
      showToast(`Marked "${target?.title}" as Upcoming`);
    }
  };

  const handleDeleteRecurringBill = (billId) => {
    const updated = recurringBills.filter((b) => b.id !== billId);
    setRecurringBills(updated);
    StorageService.saveUserRecurringBills(user.email, updated);
    showToast('Recurring bill removed', 'info');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    StorageService.updateSessionUser(updatedUser);
    showToast('Profile and preferences updated!');
  };

  const handleResetData = () => {
    StorageService.resetUserToDefault(user.email);
    setTransactions(StorageService.getUserTransactions(user.email));
    setBudgets(StorageService.getUserBudgets(user.email));
    setSavingsGoals(StorageService.getUserSavingsGoals(user.email));
    setRecurringBills(StorageService.getUserRecurringBills(user.email));
    setMonthlyData(StorageService.getUserMonthlyData(user.email));
    showToast(`Restored default demo data for ${user.name}!`, 'info');
  };

  // Derive Dynamic Alerts & Notifications
  const notifications = useMemo(() => {
    if (!mounted) return [];
    const alerts = [];

    // 1. Upcoming due bills (within 4 days)
    recurringBills.forEach((bill) => {
      if (bill.status !== 'Paid') {
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
      const spent = spentByCategory[b.category] || b.spent;
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
        (b) => b.status !== 'Paid' && getRelativeDueDate(b.dueDate).status !== 'normal'
      ).length
    : 0;

  const overBudgetsCount = mounted
    ? budgets.filter((b) => {
        const spent = transactions
          .filter((t) => t.type === 'expense' && t.category === b.category)
          .reduce((s, t) => s + Number(t.amount), 0);
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
            Verifying FINTRACK session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 animate-fade-in text-xs sm:text-sm font-semibold">
          {toastMessage.type === 'info' ? (
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
