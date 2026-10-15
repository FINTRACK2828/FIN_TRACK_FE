import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const source = await readFile(new URL('../src/lib/api.js', import.meta.url), 'utf8');
const apiUrl = `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const api = await import(apiUrl);
const storageSource = (await readFile(new URL('../src/lib/storage.js', import.meta.url), 'utf8')).replace("'./api'", JSON.stringify(apiUrl));
const { StorageService } = await import(`data:text/javascript;base64,${Buffer.from(storageSource).toString('base64')}`);
function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
}
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.window = new EventTarget();
const ok = data => ({ ok: true, status: 200, json: async () => ({ success: true, data }) });

test('login stores the JWT, respects remember-me, and forwards authorization', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/backend/auth/login');
    assert.equal(options.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), { email: 'alice@example.com', password: 'secret-password' });
    return ok({ user: { id: 1, name: 'Alice', email: 'alice@example.com' }, token: 'jwt' });
  };
  assert.equal((await StorageService.authenticate(' alice@example.com ', 'secret-password', false)).success, true);
  assert.equal(localStorage.getItem('fintrack_api_session'), null);
  assert.equal(api.getSession().token, 'jwt');
  assert.equal(JSON.stringify(api.getSession()).includes('secret-password'), false);
  globalThis.fetch = async (url, options) => { assert.equal(options.headers.Authorization, 'Bearer jwt'); return ok([]); };
  await api.request('/categories');
});

test('expired credentials clear the session and emit an expiry event', async () => {
  let expired = false;
  window.addEventListener('fintrack-session-expired', () => { expired = true; }, { once: true });
  globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ success: false, message: 'Session expired' }) });
  await assert.rejects(api.request('/users/me'), /Session expired/);
  assert.equal(api.getSession(), null);
  assert.equal(expired, true);
});

test('failed login never creates a session', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({ success: false, message: 'Invalid email or password' }) });
  assert.deepEqual(await StorageService.authenticate('a@example.com', 'bad'), { success: false, error: 'Invalid email or password' });
  assert.equal(api.getSession(), null);
});

test('dashboard loads every transaction page and maps backend fields', async () => {
  const calls = [];
  globalThis.fetch = async url => {
    calls.push(url);
    if (url.endsWith('/users/me')) return ok({ id: 1, name: 'Alice', email: 'a@example.com' });
    if (url.endsWith('/categories')) return ok([{ id: 5, name: 'Food', type: 'expense' }]);
    if (url.includes('/transactions?')) return ok({ items: [{ id: url.includes('page=2') ? 2 : 1, category_name: 'Food', description: 'Lunch', amount: '12.50', transaction_date: '2026-10-14' }], pagination: { total_pages: 2 } });
    if (url.includes('/budgets?')) return ok([{ id: 3, category_name: 'Food', amount: '100.00', spent: '25.00' }]);
    if (url.endsWith('/goals')) return ok([{ id: 4, name: 'Laptop', target_amount: '1000.00', saved_amount: '100.00', target_date: null }]);
    if (url.endsWith('/recurring')) return ok([{ id: 5, name: 'Rent', amount: '50.00', frequency: 'monthly', next_payment_date: '2026-11-01', active: false }]);
    return ok({ months: [{ month: 10, income: '100.00', expenses: '25.00', net_savings: '75.00' }] });
  };
  const data = await api.FinanceService.load();
  assert.equal(data.transactions.length, 2);
  assert.equal(data.transactions[0].amount, 12.5);
  assert.equal(data.budgets[0].allocated, 100);
  assert.equal(data.savingsGoals[0].currentAmount, 100);
  assert.equal(data.recurringBills[0].status, 'Paused');
  assert.equal(data.monthlyData[0].expense, 25);
  assert.ok(calls.some(url => url.includes('page=2')));
});

test('transaction writes use server category IDs and strict request fields', async () => {
  globalThis.fetch = async (url, options) => {
    if (url.endsWith('/categories')) return ok([{ id: 5, name: 'Food', type: 'expense' }]);
    assert.equal(url, '/api/backend/transactions/7');
    assert.equal(options.method, 'PUT');
    assert.deepEqual(JSON.parse(options.body), { category_id: 5, type: 'expense', amount: '12.5', description: 'Lunch', transaction_date: '2026-10-14' });
    return ok({ id: 7 });
  };
  await api.FinanceService.saveTransaction({ id: 7, category: 'Food', type: 'expense', amount: 12.5, title: 'Lunch', date: '2026-10-14', user_id: 999 }, true);
});

test('unavailable backend produces a useful error', async () => {
  globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
  await assert.rejects(api.request('/users/me'), /Cannot reach the backend/);
});
