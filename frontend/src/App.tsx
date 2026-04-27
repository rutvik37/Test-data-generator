import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Database, Loader2, LogOut, User as UserIcon, RotateCcw } from 'lucide-react';

// Component imports
import SchemaBuilder from './components/SchemaBuilder';
import TemplateSelector from './components/TemplateSelector';
import DataPreview from './components/DataPreview';
import ExportButtons from './components/ExportButtons';
import AuthModal from './components/AuthModal';
import Toast, { ToastType } from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import EditProfileModal from './components/EditProfileModal';
import TestCaseViewer from './components/TestCaseViewer';
import { generateTestCases } from './utils/testCaseGenerator';

import useLocalStorage from './hooks/useLocalStorage';
import { SchemaField, GeneratedRecord, User, AuthMode, TestCaseResult } from './types';

function App() {
  const [schema, setSchema] = useLocalStorage<SchemaField[]>('ai-test-data-schema', [
    { name: 'id', type: 'UUID' },
    { name: 'name', type: 'Full Name' },
    { name: 'email', type: 'Email' },
  ]);

  const [count, setCount] = useState<number | string>(10);
  const [data, setData] = useState<GeneratedRecord[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('ai-test-data-dark', false);

  // Test Cases State
  const [viewMode, setViewMode] = useState<'data' | 'test-cases'>('data');
  const [testCases, setTestCases] = useState<TestCaseResult | null>(null);
  const [includeSteps, setIncludeSteps] = useState(true);
  const [includeExpectedResult, setIncludeExpectedResult] = useState(true);

  // Auth state
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('ai-test-data-user', null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Toast & Modal state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleGenerate = async (): Promise<void> => {
    const validSchema = schema.filter((f) => f.name.trim() !== '');
    if (validSchema.length === 0) {
      setError('Please add at least one valid field with a name.');
      return;
    }

    const names = validSchema.map((f) => f.name.trim());
    const uniqueNames = new Set(names);
    if (uniqueNames.size !== names.length) {
      setError('Field names must be unique. Duplicate names will overwrite each other.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/generate';
      const response = await axios.post<GeneratedRecord[]>(apiUrl, {
        schema: validSchema,
        count: count,
      });
      setData(response.data);
    } catch (err) {
      const axiosErr = err as AxiosError<{ error: string }>;
      setError(axiosErr.response?.data?.error || 'Failed to generate data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTestCases = () => {
    const validSchema = schema.filter((f) => f.name.trim() !== '');
    if (validSchema.length === 0) {
      setError('Please add at least one valid field with a name to generate test cases.');
      return;
    }
    
    setError(null);
    const result = generateTestCases(validSchema, { includeSteps, includeExpectedResult });
    setTestCases(result);
    setViewMode('test-cases');
    setToast({ message: 'Test cases generated successfully!', type: 'success' });
  };

  return (
    <div className={`min-h-screen pb-12 ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Test data generator
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Dark mode
                </span>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setToast({ message: 'Please sign in to use dark mode.', type: 'error' });
                      return;
                    }
                    setDarkMode(!darkMode);
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                  title="Toggle Dark Mode"
                >
                  <span className="sr-only">Toggle Dark Mode</span>
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>

              <div className="h-6 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1"></div>

              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="relative group focus:outline-none"
                      title="Edit Profile"
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${currentUser.username}&background=6366f1&color=fff&bold=true`}
                        alt={currentUser.username}
                        className="w-8 h-8 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-sm group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="sr-only">Edit</span>
                      </div>
                    </button>
                    <span className="hidden sm:inline font-bold">{currentUser.username}</span>
                  </div>
                  <button
                    onClick={() => setIsLogoutConfirmOpen(true)}
                    className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAuthMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setAuthMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2 rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <TemplateSelector setSchema={setSchema} />
            <SchemaBuilder schema={schema} setSchema={setSchema} />

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Generation Settings</h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of Records
                </label>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  value={count}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCount('');
                      return;
                    }
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) {
                      setCount(num > 9999 ? 9999 : num);
                    }
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <button
                onClick={() => {
                  const finalCount = parseInt(String(count), 10);
                  if (isNaN(finalCount) || finalCount < 1) {
                    setError('Please enter a valid number of records (1-9999).');
                    return;
                  }

                  // 🔐 Guest limitations
                  if (!currentUser) {
                    if (data) {
                      setToast({ message: 'Please sign in to regenerate data.', type: 'error' });
                      return;
                    }
                    if (finalCount > 10) {
                      setToast({ message: 'Please sign in to generate more than 10 records.', type: 'error' });
                      return;
                    }
                  }

                  handleGenerate();
                }}
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 text-white py-2 px-4 rounded shadow transition-colors font-medium"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (data ? 'Regenerate Data' : 'Generate Data')}
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 mb-4">
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={includeSteps} onChange={e => setIncludeSteps(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    Include Steps
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input type="checkbox" checked={includeExpectedResult} onChange={e => setIncludeExpectedResult(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600" />
                    Expected Result
                  </label>
                </div>
                <button
                  onClick={handleGenerateTestCases}
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 dark:disabled:bg-emerald-800 text-white py-2 px-4 rounded shadow transition-colors font-medium"
                >
                  Generate Test Cases
                </button>
              </div>

              <button
                disabled={loading}
                onClick={() => {
                  setSchema([{ name: '', type: 'String' }]);
                  setData(null);
                  setTestCases(null);
                  setCount(10);
                  setError(null);
                  setToast({ message: 'All settings have been reset.', type: 'success' });
                }}
                className="w-full mt-3 flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors py-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <RotateCcw size={16} /> Reset All Settings
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 min-h-[500px] flex flex-col">
              <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
                <button
                  onClick={() => setViewMode('data')}
                  className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${viewMode === 'data' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  Data Preview
                </button>
                <button
                  onClick={() => setViewMode('test-cases')}
                  className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 ${viewMode === 'test-cases' ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                >
                  Test Cases
                </button>
              </div>

              {viewMode === 'data' ? (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Data Preview</h2>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {data ? `${data.length} records generated` : 'No records yet'}
                    </div>
                  </div>
                  <ExportButtons data={data} onReset={() => setData(null)} />
                  <DataPreview data={data} />
                </>
              ) : (
                <TestCaseViewer testCases={testCases} onReset={() => setTestCases(null)} />
              )}
            </div>
          </div>
        </div>
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSuccess={(user) => {
          setCurrentUser(user);
          setToast({
            message: authMode === 'signin' ? `Welcome back, ${user.username}!` : `Account created for ${user.username}!`,
            type: 'success'
          });
        }}
      />

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Logout Confirmation"
        message="Are you sure you want to logout?"
        onConfirm={() => {
          setCurrentUser(null);
          setDarkMode(false);
          setIsLogoutConfirmOpen(false);
          setToast({ message: 'Successfully logged out.', type: 'success' });
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          currentUser={currentUser}
          onUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            setToast({ message: 'Profile updated successfully!', type: 'success' });
          }}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
