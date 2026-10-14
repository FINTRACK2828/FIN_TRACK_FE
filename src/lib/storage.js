// LocalStorage Management and Persistence for FINTRACK
// Frontend Demo Authentication and User-Scoped Financial Data

import {
  DEFAULT_DEMO_ACCOUNTS,
  INITIAL_TRANSACTIONS,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_RECURRING_BILLS,
  INITIAL_MONTHLY_DATA,
  PRIYA_TRANSACTIONS,
  PRIYA_BUDGETS,
  PRIYA_SAVINGS_GOALS,
  PRIYA_RECURRING_BILLS,
  PRIYA_MONTHLY_DATA,
  createStarterDataForUser,
} from '@/data/mockData';

const KEYS = {
  REGISTERED_USERS: 'fintrack_registered_users',
  SESSION_USER: 'fintrack_session_user',
};

function getFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

function getUserDataKey(email, dataType) {
  const safeEmail = (email || 'default').toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `fintrack_data_${safeEmail}_${dataType}`;
}

// Initializer helper for specific users
function getDefaultUserData(email) {
  const normalized = (email || '').toLowerCase();
  if (normalized === 'rahul.sharma@fintrack.in') {
    return {
      transactions: INITIAL_TRANSACTIONS,
      budgets: INITIAL_BUDGETS,
      savingsGoals: INITIAL_SAVINGS_GOALS,
      recurringBills: INITIAL_RECURRING_BILLS,
      monthlyData: INITIAL_MONTHLY_DATA,
    };
  } else if (normalized === 'priya.patel@fintrack.in') {
    return {
      transactions: PRIYA_TRANSACTIONS,
      budgets: PRIYA_BUDGETS,
      savingsGoals: PRIYA_SAVINGS_GOALS,
      recurringBills: PRIYA_RECURRING_BILLS,
      monthlyData: PRIYA_MONTHLY_DATA,
    };
  } else {
    // Generate starter data for new user
    return createStarterDataForUser({ name: 'User' });
  }
}

export const StorageService = {
  // --- AUTHENTICATION & USERS ---
  getRegisteredUsers: () => {
    return getFromStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
  },

  registerUser: (newUser) => {
    if (typeof window === 'undefined') return { success: false, error: 'Client only' };
    
    const users = getFromStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
    const emailNorm = newUser.email.trim().toLowerCase();

    // Check if user already exists
    const exists = users.some((u) => u.email.trim().toLowerCase() === emailNorm);
    if (exists) {
      return {
        success: false,
        error: 'An account with this email address is already registered. Please log in.',
      };
    }

    const initials = (newUser.name || 'User')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const fullUser = {
      ...newUser,
      email: emailNorm,
      avatar: initials,
      currency: 'INR',
      currencySymbol: '₹',
      financialYearStart: 'April',
      notifications: {
        billAlerts: true,
        budgetWarnings: true,
        weeklyReport: true,
        promotions: false,
      },
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, fullUser];
    saveToStorage(KEYS.REGISTERED_USERS, updatedUsers);

    // Initialize custom starter data for this new account
    const starter = createStarterDataForUser(fullUser);
    saveToStorage(getUserDataKey(emailNorm, 'transactions'), starter.transactions);
    saveToStorage(getUserDataKey(emailNorm, 'budgets'), starter.budgets);
    saveToStorage(getUserDataKey(emailNorm, 'savings_goals'), starter.savingsGoals);
    saveToStorage(getUserDataKey(emailNorm, 'recurring_bills'), starter.recurringBills);
    saveToStorage(getUserDataKey(emailNorm, 'monthly_data'), starter.monthlyData);

    return { success: true, user: fullUser };
  },

  authenticate: (email, password) => {
    if (typeof window === 'undefined') return { success: false, error: 'Client only' };

    const users = getFromStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
    const emailNorm = (email || '').trim().toLowerCase();
    const user = users.find((u) => u.email.trim().toLowerCase() === emailNorm);

    if (!user) {
      return {
        success: false,
        error: 'No registered account found with this email. Please check your spelling or register a new account.',
      };
    }

    if (user.password !== password) {
      return {
        success: false,
        error: 'Incorrect password entered. For demo testing, use "password123" or reset below.',
      };
    }

    return { success: true, user };
  },

  resetPassword: (email, newPassword) => {
    if (typeof window === 'undefined') return { success: false, error: 'Client only' };
    const users = getFromStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
    const emailNorm = (email || '').trim().toLowerCase();
    
    const userIndex = users.findIndex((u) => u.email.trim().toLowerCase() === emailNorm);
    if (userIndex === -1) {
      return { success: false, error: 'Email address not found in demo registry.' };
    }

    users[userIndex].password = newPassword;
    saveToStorage(KEYS.REGISTERED_USERS, users);
    return { success: true, message: `Password successfully updated to "${newPassword}".` };
  },

  // --- SESSION MANAGEMENT ---
  getSessionUser: () => {
    // Returns active logged-in user or null if unauthenticated
    return getFromStorage(KEYS.SESSION_USER, null);
  },

  setSessionUser: (user) => {
    saveToStorage(KEYS.SESSION_USER, user);
  },

  logout: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEYS.SESSION_USER);
  },

  updateSessionUser: (updatedUser) => {
    saveToStorage(KEYS.SESSION_USER, updatedUser);

    // Also update in registered list
    const users = getFromStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
    const emailNorm = updatedUser.email.trim().toLowerCase();
    const nextUsers = users.map((u) => (u.email.toLowerCase() === emailNorm ? updatedUser : u));
    saveToStorage(KEYS.REGISTERED_USERS, nextUsers);
  },

  // --- USER-SCOPED DATA ACCESS ---
  getUserTransactions: (email) => {
    const key = getUserDataKey(email, 'transactions');
    const fallback = getDefaultUserData(email).transactions;
    return getFromStorage(key, fallback);
  },
  saveUserTransactions: (email, txs) => {
    const key = getUserDataKey(email, 'transactions');
    saveToStorage(key, txs);
  },

  getUserBudgets: (email) => {
    const key = getUserDataKey(email, 'budgets');
    const fallback = getDefaultUserData(email).budgets;
    return getFromStorage(key, fallback);
  },
  saveUserBudgets: (email, budgets) => {
    const key = getUserDataKey(email, 'budgets');
    saveToStorage(key, budgets);
  },

  getUserSavingsGoals: (email) => {
    const key = getUserDataKey(email, 'savings_goals');
    const fallback = getDefaultUserData(email).savingsGoals;
    return getFromStorage(key, fallback);
  },
  saveUserSavingsGoals: (email, goals) => {
    const key = getUserDataKey(email, 'savings_goals');
    saveToStorage(key, goals);
  },

  getUserRecurringBills: (email) => {
    const key = getUserDataKey(email, 'recurring_bills');
    const fallback = getDefaultUserData(email).recurringBills;
    return getFromStorage(key, fallback);
  },
  saveUserRecurringBills: (email, bills) => {
    const key = getUserDataKey(email, 'recurring_bills');
    saveToStorage(key, bills);
  },

  getUserMonthlyData: (email) => {
    const key = getUserDataKey(email, 'monthly_data');
    const fallback = getDefaultUserData(email).monthlyData;
    return getFromStorage(key, fallback);
  },
  saveUserMonthlyData: (email, data) => {
    const key = getUserDataKey(email, 'monthly_data');
    saveToStorage(key, data);
  },

  // Reset only active user's data
  resetUserToDefault: (email) => {
    if (typeof window === 'undefined') return;
    const defaults = getDefaultUserData(email);
    saveToStorage(getUserDataKey(email, 'transactions'), defaults.transactions);
    saveToStorage(getUserDataKey(email, 'budgets'), defaults.budgets);
    saveToStorage(getUserDataKey(email, 'savings_goals'), defaults.savingsGoals);
    saveToStorage(getUserDataKey(email, 'recurring_bills'), defaults.recurringBills);
    saveToStorage(getUserDataKey(email, 'monthly_data'), defaults.monthlyData);
  },

  // Factory reset everything
  resetAllToFactory: () => {
    if (typeof window === 'undefined') return;
    localStorage.clear();
    saveToStorage(KEYS.REGISTERED_USERS, DEFAULT_DEMO_ACCOUNTS);
    saveToStorage(KEYS.SESSION_USER, DEFAULT_DEMO_ACCOUNTS[0]);
  },
};
