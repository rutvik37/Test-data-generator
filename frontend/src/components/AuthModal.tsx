import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Mail, Lock, Eye, EyeOff, User as UserIcon, CheckCircle, RefreshCw } from 'lucide-react';
import { AuthMode, User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: AuthMode;
  onSuccess: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [currentMode, setCurrentMode] = useState<AuthMode>(mode);
  const [error, setError] = useState<string | null>(null);
  
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [tempUser, setTempUser] = useState<(User & { password?: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setEmail('');
      setLoginId('');
      setPassword('');
      setConfirmPassword('');
      setError(null);
      setOtp('');
      setResendCooldown(0);
      setTempUser(null);
      setCurrentMode(mode);
    }
  }, [isOpen, mode]);

  useEffect(() => {
    let timer: number;
    if (resendCooldown > 0) {
      timer = window.setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;
  const activeMode = currentMode;

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUsername = (username: string) => {
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/generate')[0] : 'http://localhost:5001/api';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeMode === 'signup') {
      if (!validateUsername(username)) {
        setError('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
        return;
      }
      if (!validateEmail(email)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 4) {
        setError('Password must be at least 4 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        await axios.post(`${getApiUrl()}/signup`, { email, username, password });
        setTempUser({ email, username, password });
        setCurrentMode('verify-otp');
        setResendCooldown(30);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to sign up. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    } else if (activeMode === 'verify-otp') {
      if (otp.length !== 6) {
        setError('OTP must be 6 digits.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await axios.post(`${getApiUrl()}/verify-otp`, { email: tempUser?.email, otp });
        
        // Success
        onSuccess(res.data.user);
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.error || 'Invalid OTP.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Sign In logic
      setIsLoading(true);
      try {
        const res = await axios.post(`${getApiUrl()}/signin`, { identifier: loginId, password });
        onSuccess(res.data.user);
        onClose();
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('User not found');
        } else if (err.response?.status === 401) {
          setError('Invalid credentials');
        } else {
          setError(err.response?.data?.error || 'Failed to sign in');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setError(null);
    setIsLoading(true);
    try {
      await axios.post(`${getApiUrl()}/resend-otp`, { email: tempUser?.email, username: tempUser?.username });
      setResendCooldown(30);
      setOtp('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeMode === 'signin' ? 'Sign In' : activeMode === 'signup' ? 'Create Account' : 'Verify Email'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeMode === 'verify-otp' ? (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  We've sent a 6-digit verification code to <span className="font-semibold text-gray-900 dark:text-white">{tempUser?.email}</span>. Please enter it below.
                </p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Verification Code
                </label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-4 py-3 text-center tracking-widest font-mono text-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="123456"
                  />
                </div>
              </div>
            ) : (
              <>
                {activeMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="johndoe"
                      />
                    </div>
                  </div>
                )}
                {activeMode === 'signin' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email or Username
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Email or username"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {activeMode === 'signup' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              {isLoading ? 'Processing...' : activeMode === 'signin' ? 'Sign In' : activeMode === 'signup' ? 'Sign Up' : 'Verify OTP'}
            </button>
          </form>

          {activeMode === 'verify-otp' ? (
             <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
               <button
                 type="button"
                 onClick={handleResendOtp}
                 disabled={resendCooldown > 0 || isLoading}
                 className="flex items-center justify-center w-full gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
               >
                 <RefreshCw size={16} className={isLoading && resendCooldown === 0 ? "animate-spin" : ""} />
                 {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
               </button>
               <button
                  type="button"
                  onClick={() => { setError(null); setCurrentMode('signup'); }}
                  className="mt-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs underline"
                >
                  Change Email / Back to Sign Up
                </button>
             </div>
          ) : (
            <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              {activeMode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setCurrentMode('signup'); }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setError(null); setCurrentMode('signin'); }}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
