// Currency and formatting utilities for FINTRACK

/**
 * Format a number into Indian Rupees (INR) format (e.g. ₹1,45,000)
 */
export function formatINR(amount, showDecimals = false) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  const numericAmount = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: showDecimals ? 2 : 0,
    minimumFractionDigits: showDecimals ? 2 : 0,
  }).format(numericAmount);
}

/**
 * Format date to readable string (e.g., "11 Oct, 2026")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative due date (e.g. "Due in 3 days", "Overdue by 2 days", "Today")
 */
export function getRelativeDueDate(dueDateStr, baseDate = null) {
  if (!dueDateStr) return '';
  const current = baseDate || (typeof window !== 'undefined' ? new Date() : new Date('2026-10-11T00:00:00'));
  const today = new Date(current);
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Overdue by ${Math.abs(diffDays)}d`, status: 'overdue' };
  } else if (diffDays === 0) {
    return { text: 'Due Today', status: 'due-today' };
  } else if (diffDays <= 3) {
    return { text: `Due in ${diffDays}d`, status: 'due-soon' };
  } else {
    return { text: `Due in ${diffDays}d`, status: 'normal' };
  }
}

/**
 * Helper to calculate category color tags
 */
export const CATEGORY_COLORS = {
  'Salary': { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: '#10B981' },
  'Freelance': { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: '#14B8A6' },
  'Investments': { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: '#3B82F6' },
  'Dividends': { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: '#6366F1' },
  'Housing & Rent': { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: '#F43F5E' },
  'Food & Dining': { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: '#F59E0B' },
  'Groceries': { bg: 'bg-lime-50 text-lime-700 border-lime-200', dot: '#84CC16' },
  'Utilities & Bills': { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: '#0EA5E9' },
  'Shopping': { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: '#A855F7' },
  'Travel & Commute': { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: '#F97316' },
  'Healthcare': { bg: 'bg-pink-50 text-pink-700 border-pink-200', dot: '#EC4899' },
  'Entertainment': { bg: 'bg-violet-50 text-violet-700 border-violet-200', dot: '#8B5CF6' },
  'Education': { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: '#06B6D4' },
  'Other': { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: '#64748B' },
};

export function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}
