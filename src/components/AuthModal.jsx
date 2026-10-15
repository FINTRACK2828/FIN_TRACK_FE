'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle2, IndianRupee } from 'lucide-react';

import { StorageService } from '@/lib/storage';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    const result = authMode === 'login'
      ? await StorageService.authenticate(formData.email, formData.password)
      : await StorageService.registerUser(formData);
    setLoading(false);
    if (!result.success) { setError(result.error); return; }
    await onLoginSuccess(result.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Brand Banner */}
        <div className="bg-[#0B132B] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
              <IndianRupee className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              FIN<span className="text-emerald-400">TRACK</span>
            </span>
          </div>
          <h3 className="text-lg font-bold">
            {authMode === 'login' ? 'Welcome Back!' : 'Create FINTRACK Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sign in to your FINTRACK account
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-1">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authMode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Register Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
          {authMode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <button
              type="submit" disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer"
            >
              {authMode === 'login' ? 'Sign In to Dashboard' : 'Create & Access Dashboard'}
            </button>
        </form>
      </div>
    </div>
  );
}
