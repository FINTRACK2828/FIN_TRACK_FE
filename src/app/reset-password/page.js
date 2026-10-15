'use client';

import { useState } from 'react';
import Link from 'next/link';
import { request } from '@/lib/api';
import { StorageService } from '@/lib/storage';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submit = async event => {
    event.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) { setError('Open the password reset link from your email.'); return; }
    setLoading(true);
    try {
      await request('/auth/reset-password', { method: 'POST', token: null, body: { token, new_password: password } });
      StorageService.logout();
      setDone(true);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
        {error && <p role="alert" className="text-rose-600 text-sm">{error}</p>}
        {done ? <p className="text-emerald-700">Password updated. <Link className="underline" href="/login">Sign in</Link></p> : (
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm text-slate-700">New password
              <input type="password" autoComplete="new-password" minLength={10} maxLength={72} required value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
            </label>
            <label className="block text-sm text-slate-700">Confirm password
              <input type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3" />
            </label>
            <button disabled={loading} className="w-full rounded-xl bg-emerald-600 p-3 font-bold text-white disabled:opacity-60">{loading ? 'Saving...' : 'Save new password'}</button>
          </form>
        )}
      </div>
    </main>
  );
}
