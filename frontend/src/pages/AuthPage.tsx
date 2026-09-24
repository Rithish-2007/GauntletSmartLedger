import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, KeyRound, ArrowLeft, Check } from 'lucide-react';
import { loginUser, registerUser, resetPasswordUser } from '../services/api';
import type { UserSummary } from '../types/analytics';
import { GoldenThunderLogo } from '../components/GoldenThunderLogo';

interface AuthPageProps {
  onAuthSuccess: (user: UserSummary) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Traditional Password Validation Criteria
  const passwordCriteria = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasDigit: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password),
  };

  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;
  const isPasswordValid = passedCriteriaCount === 5;

  const getStrengthLabel = () => {
    if (!password) return { text: '', color: 'bg-zinc-800', textColor: 'text-zinc-500' };
    if (passedCriteriaCount <= 2) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (passedCriteriaCount <= 4) return { text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const user = await loginUser(email, password);
        onAuthSuccess(user);
      } else if (mode === 'register') {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setIsLoading(false);
          return;
        }
        if (!isPasswordValid) {
          setError('Password must meet all 5 security requirements below.');
          setIsLoading(false);
          return;
        }
        const user = await registerUser(fullName, email, password);
        onAuthSuccess(user);
      } else if (mode === 'forgot') {
        if (!email.trim() || !password.trim()) {
          setError('Please provide email and new password');
          setIsLoading(false);
          return;
        }
        if (!isPasswordValid) {
          setError('New password must meet all 5 security requirements below.');
          setIsLoading(false);
          return;
        }
        const msg = await resetPasswordUser(email, password);
        setSuccessMsg(msg);
        setMode('login');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message && err.message !== '[object Object]' ? err.message : 'Action failed. Please try again.';
        setError(msg);
      } else if (typeof err === 'string' && err.trim() && err !== '[object Object]') {
        setError(err.trim());
      } else {
        setError('Action failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      const user = await loginUser('demo@smartledger.local', 'demo123');
      onAuthSuccess(user);
    } catch {
      // Fallback
      onAuthSuccess({
        id: 1,
        fullName: 'Rithish Kumar',
        email: 'demo@smartledger.local',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#09090b] flex flex-col justify-center items-center px-3 sm:px-6 lg:px-8 py-6 sm:py-12 relative overflow-hidden font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Background ambient decorative glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 sm:mb-8 relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 border border-amber-500/25 shadow-inner mb-1 sm:mb-2">
          <GoldenThunderLogo size="sm" />
          <span className="text-sm font-bold text-white tracking-tight">
            GauntletSmartLedger<span className="text-amber-400">™</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            PRO
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Household Utility Command Console
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto font-mono">
          Executive resource tracking, TNEB slab calculation & real-time expense telemetry.
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-zinc-950/90 border border-zinc-800/90 rounded-2xl p-4 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-5 sm:space-y-6">
        {/* Header Tabs */}
        {mode !== 'forgot' ? (
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 font-mono text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700/80'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <KeyRound className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Reset Account Password</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 text-xs font-mono rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 text-xs font-mono rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 animate-in fade-in duration-150">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rithish Kumar"
                  required
                  className="w-full pl-9 pr-3 py-2 text-sm font-sans bg-zinc-900/80 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-1.5">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@smartledger.local"
                required
                className="w-full pl-9 pr-3 py-2 text-sm font-sans bg-zinc-900/80 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono text-zinc-400">
                {mode === 'forgot' ? 'New Password' : 'Password'}
              </label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'forgot' ? 'Enter new password' : '••••••••'}
                required
                className="w-full pl-9 pr-10 py-2 text-sm font-sans bg-zinc-900/80 border border-zinc-700/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Complexity Checklist & Strength Indicator for Registration / Reset */}
            {mode !== 'login' && (
              <div className="mt-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-400">Password Strength</span>
                  <span className={`font-semibold ${getStrengthLabel().textColor}`}>
                    {getStrengthLabel().text || 'Enter password'}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        passedCriteriaCount >= step ? getStrengthLabel().color : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <div className={`flex items-center space-x-1.5 transition-colors ${passwordCriteria.hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${passwordCriteria.hasMinLength ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>8+ characters</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 transition-colors ${passwordCriteria.hasUpperCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${passwordCriteria.hasUpperCase ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Uppercase (A-Z)</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 transition-colors ${passwordCriteria.hasLowerCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${passwordCriteria.hasLowerCase ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Lowercase (a-z)</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 transition-colors ${passwordCriteria.hasDigit ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${passwordCriteria.hasDigit ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Number (0-9)</span>
                  </div>

                  <div className={`flex items-center space-x-1.5 transition-colors ${passwordCriteria.hasSpecial ? 'text-emerald-400' : 'text-zinc-500'} sm:col-span-2`}>
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 border ${passwordCriteria.hasSpecial ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' : 'border-zinc-700 bg-zinc-800 text-zinc-600'}`}>
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>Special symbol (!@#$%^&*)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? 'Sign In to Dashboard'
                    : mode === 'register'
                    ? 'Create & Launch Console'
                    : 'Reset Password & Save'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-zinc-800 w-full" />
          <span className="bg-zinc-950 px-3 text-[11px] font-mono text-zinc-500 uppercase absolute">
            or explore instantly
          </span>
        </div>

        {/* Demo Fast Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer group"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span>One-Click Demo Account Login</span>
        </button>

        {/* Feature List */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-1.5 text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Domestic TNEB Bi-monthly progressive tariff engine</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Thermodynamic LPG cylinder burn rate telemetry</span>
          </div>
          <div className="flex items-center space-x-2 text-zinc-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Family telecom expiry matrix & trip mileage ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
