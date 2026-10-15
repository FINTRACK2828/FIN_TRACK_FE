const SESSION_KEY = 'fintrack_api_session';
export function getSession() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null'); }
  catch { return null; }
}
export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('fintrack_session_user');
  localStorage.removeItem('fintrack_registered_users');
}
export function saveSession(session, remember = true) {
  clearSession();
  (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session));
}
export async function request(path, { method = 'GET', body, token = getSession()?.token } = {}) {
  let response;
  try {
    response = await fetch(`/api/backend${path}`, {
      method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store',
    });
  } catch { throw new Error('Cannot reach the backend. Check that it is running and try again.'); }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    if (response.status === 401 && token) {
      clearSession();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('fintrack-session-expired'));
    }
    throw new Error(result?.message || 'Backend request failed. Check that the backend is running.');
  }
  return result.data;
}
export function toUser(user) {
  return { ...user, avatar: user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase(), currency: 'INR', currencySymbol: '₹', role: 'FINTRACK Member', phone: '', city: '', financialYearStart: 'April', notifications: { billAlerts: true, budgetWarnings: true, weeklyReport: true } };
}
export const FinanceService = {
  async load() {
    const now = new Date();
    const [profile, categories, first, budgets, goals, recurring, monthly] = await Promise.all([
      request('/users/me'), request('/categories'), request('/transactions?limit=100'),
      request(`/budgets?month=${now.getMonth() + 1}&year=${now.getFullYear()}`), request('/goals'), request('/recurring'), request(`/dashboard/monthly-summary?year=${now.getFullYear()}`),
    ]);
    const transactions = [...first.items];
    for (let page = 2; page <= first.pagination.total_pages; page++) transactions.push(...(await request(`/transactions?limit=100&page=${page}`)).items);
    return {
      user: toUser(profile), categories,
      transactions: transactions.map(t => ({ ...t, title: t.description || t.category_name, amount: Number(t.amount), category: t.category_name, date: t.transaction_date, notes: '', paymentMethod: '', status: 'Completed' })),
      budgets: budgets.map(b => ({ ...b, category: b.category_name, allocated: Number(b.amount), spent: Number(b.spent) })),
      savingsGoals: goals.map(g => ({ ...g, title: g.name, targetAmount: Number(g.target_amount), currentAmount: Number(g.saved_amount), deadline: g.target_date, notes: g.description, category: 'Other', color: 'emerald' })),
      recurringBills: recurring.map(r => ({ ...r, title: r.name, provider: '', amount: Number(r.amount), billingCycle: r.frequency[0].toUpperCase() + r.frequency.slice(1), dueDate: r.next_payment_date, category: r.category_name, status: r.active ? 'Upcoming' : 'Paused' })),
      monthlyData: monthly.months.map(m => ({ year: monthly.year, month: new Date(2000, m.month - 1, 1).toLocaleString('en', { month: 'short' }), income: Number(m.income), expense: Number(m.expenses), savings: Number(m.net_savings) })),
    };
  },
  async categoryId(name, type) {
    const categories = await request('/categories');
    const category = categories.find(c => c.name === name && c.type === type);
    if (!category) throw new Error('Select an available category.');
    return category.id;
  },
  async saveTransaction(t, edit) {
    return request(`/transactions${edit ? `/${t.id}` : ''}`, { method: edit ? 'PUT' : 'POST', body: { category_id: await this.categoryId(t.category, t.type), type: t.type, amount: String(t.amount), description: t.title, transaction_date: t.date } });
  },
  async saveBudget(b, edit) {
    const now = new Date();
    return request(`/budgets${edit ? `/${b.id}` : ''}`, { method: edit ? 'PUT' : 'POST', body: { category_id: await this.categoryId(b.category, 'expense'), amount: String(b.allocated), month: b.month || now.getMonth() + 1, year: b.year || now.getFullYear() } });
  },
  async addGoal(g) {
    const goal = await request('/goals', { method: 'POST', body: { name: g.title, target_amount: String(g.targetAmount), target_date: g.deadline || null, description: g.notes || '' } });
    if (g.currentAmount > 0) {
      try { await this.contribute(goal.id, g.currentAmount); }
      catch (error) { throw new Error(`Goal created, but initial contribution failed: ${error.message}`); }
    }
    return goal;
  },
  contribute(id, amount) {
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return request(`/goals/${id}/contributions`, { method: 'POST', body: { amount: String(amount), contribution_date: date } });
  },
  async saveRecurring(b, edit) {
    return request(`/recurring${edit ? `/${b.id}` : ''}`, { method: edit ? 'PUT' : 'POST', body: { name: b.title, amount: String(b.amount), frequency: b.billingCycle.toLowerCase(), next_payment_date: b.dueDate, category_id: await this.categoryId(b.category, 'expense'), active: b.active ?? true } });
  },
  remove(resource, id) { return request(`/${resource}/${id}`, { method: 'DELETE' }); },
  updateUser(user) { return request('/users/me', { method: 'PUT', body: { name: user.name, email: user.email } }); },
};
