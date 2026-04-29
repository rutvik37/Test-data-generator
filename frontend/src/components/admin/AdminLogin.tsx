import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Loader2, KeyRound, Mail } from 'lucide-react';
import Toast, { ToastType } from '../Toast';

export default function AdminLogin() {
  const [loginMethod, setLoginMethod] = useState<'credentials' | 'code'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Admin Portal';
    return () => { document.title = 'Test data generator'; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/generate')[0] : 'http://localhost:5001/api';
      const apiUrl = `${baseUrl}/admin/signin`;
      const payload = loginMethod === 'code' ? { code } : { email, password };
      const response = await axios.post(apiUrl, payload);
      
      if (response.data.success) {
        localStorage.setItem('ai-test-data-admin', 'true');
        setToast({ message: 'Welcome to the Admin Panel!', type: 'success' });
        setTimeout(() => navigate('/admin/dashboard'), 1000);
      }
    } catch (error: any) {
      setToast({ 
        message: error.response?.data?.error || 'Invalid admin credentials', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-indigo-600 p-3 rounded-xl shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Secure access restricted to authorized personnel only.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setLoginMethod('credentials')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${loginMethod === 'credentials' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <Mail size={16} /> Credentials
            </button>
            <button
              onClick={() => setLoginMethod('code')}
              className={`flex-1 py-2 text-sm font-medium border-b-2 flex justify-center items-center gap-2 ${loginMethod === 'code' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <KeyRound size={16} /> Secret Code
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {loginMethod === 'credentials' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email address</label>
                  <div className="mt-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700">4-Digit Secret Code</label>
                <div className="mt-1">
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest text-lg"
                  />
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Sign in as Admin'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
