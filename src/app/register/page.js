'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { StorageService } from '@/lib/storage';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g., name@domain.com).';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 10) {
      errs.password = 'Password must be at least 10 characters.';
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      errs.password = 'Password must not exceed 72 UTF-8 bytes.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleNavigateToLogin = (emailToPass) => {
    const target = `/login?registered=true&email=${encodeURIComponent(emailToPass || formData.email.trim())}`;
    try {
      router.push(target);
    } catch (err) {
      console.error('Router push error:', err);
    }
    // Failsafe browser navigation
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination
          window.location.href = target;
        }
      }, 150);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const trimmedEmail = formData.email.trim();
      const res = await StorageService.registerUser({
        name: formData.name.trim(),
        email: trimmedEmail,
        password: formData.password,
        phone: '+91 98000 00000',
        city: 'India',
        role: 'FINTRACK Member',
      });

      if (!res.success) {
        setErrors({ general: res.error });
        setLoading(false);
        return;
      }

      // Successful registration
      setRegisteredSuccess(true);
      setLoading(false);

      // Clear any prior session so the new account can log in cleanly
      StorageService.logout();

      // Automatically trigger navigation after brief visual feedback
      setTimeout(() => {
        handleNavigateToLogin(trimmedEmail);
      }, 800);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ general: err.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-xl shadow-emerald-500/20 ring-1 ring-white/20 mb-3">
            <IndianRupee className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            FIN<span className="text-emerald-400">TRACK</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Smart Personal Finance Management System
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100">
          <div className="mb-6 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Start tracking budgets, transactions, and savings goals in Indian Rupees
            </p>
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Success Banner */}
          {registeredSuccess && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-fade-in space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Account Created Successfully!</span>
              </div>
              <p className="text-emerald-700 leading-relaxed">
                Your account is ready for <strong>{formData.name}</strong>.
                Redirecting to login...
              </p>
              <button
                type="button"
                onClick={() => handleNavigateToLogin(formData.email.trim())}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <span>Proceed to Login Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}

          {/* Registration Form */}
          {!registeredSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya Rao"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-slate-900 placeholder-slate-400 transition-all ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-slate-900 placeholder-slate-400 transition-all ${
                      errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 10 characters"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-slate-900 placeholder-slate-400 transition-all ${
                      errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 text-slate-900 placeholder-slate-400 transition-all ${
                      errors.confirmPassword
                        ? 'border-rose-400 focus:border-rose-500'
                        : 'border-slate-200 focus:border-emerald-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all duration-150 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Create FINTRACK Account</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-slate-400 mt-6 max-w-sm mx-auto">
          Your account and financial data are saved securely on the server.
        </p>
      </div>
    </div>
  );
}
