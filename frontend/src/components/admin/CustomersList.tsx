import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Eye, EyeOff, Loader2, UserX, Trash2, Power, PowerOff, RefreshCw } from 'lucide-react';
import Toast, { ToastType } from '../Toast';
import ConfirmModal from '../ConfirmModal';

interface Customer {
  id: string;
  email: string;
  username: string;
  passwordPlain?: string;
  profileImage?: string;
  status?: 'active' | 'deactivated' | 'deleted_by_admin' | 'deleted_by_user';
  createdAt: string;
}

const POLL_INTERVAL_MS = 10000; // 10 seconds

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchCustomers(true);

    // Start polling every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchCustomers(false);
    }, POLL_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const getBaseUrl = () =>
    import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.split('/generate')[0]
      : 'http://localhost:5001/api';

  const fetchCustomers = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const response = await axios.get(`${getBaseUrl()}/admin/users`);
      if (response.data.success) {
        const activeUsers = response.data.users.filter(
          (u: Customer) => u.status !== 'deleted_by_admin' && u.status !== 'deleted_by_user'
        );
        const sortedUsers = activeUsers.sort((a: Customer, b: Customer) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setCustomers(sortedUsers);
        setLastUpdated(new Date());
      }
    } catch (error) {
      if (isInitial) setToast({ message: 'Failed to fetch customers', type: 'error' });
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchCustomers(false);
  };

  const toggleStatus = async () => {
    if (!customerToToggle) return;
    try {
      const newStatus = customerToToggle.status === 'deactivated' ? 'active' : 'deactivated';
      const res = await axios.put(`${getBaseUrl()}/admin/users/${customerToToggle.id}/status`, { status: newStatus });
      if (res.data.success) {
        setToast({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, type: 'success' });
        setCustomerToToggle(null);
        fetchCustomers(false);
      }
    } catch (err) {
      setToast({ message: 'Failed to update user status', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      const res = await axios.delete(`${getBaseUrl()}/admin/users/${customerToDelete.id}`);
      if (res.data.success) {
        setToast({ message: 'User deleted successfully', type: 'success' });
        setCustomerToDelete(null);
        fetchCustomers(false);
      }
    } catch (err) {
      setToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  const togglePassword = (customerId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Registered Customers
          </h3>
          {/* Live indicator */}
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          {/* Manual refresh button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
            title="Refresh now"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
            Total: {customers.length}
          </span>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
          <UserX className="h-12 w-12 mb-4 text-gray-300" />
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {customer.profileImage ? (
                        <img src={customer.profileImage} alt={customer.username} className="h-8 w-8 rounded-full object-cover mr-3 border border-indigo-100" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${customer.username}&background=6366f1&color=fff&bold=true`} alt={customer.username} className="h-8 w-8 rounded-full border border-indigo-100 mr-3" />
                      )}
                      {customer.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded w-32 truncate">
                        {visiblePasswords.has(customer.id)
                          ? (customer.passwordPlain || '********')
                          : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePassword(customer.id)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                        title={visiblePasswords.has(customer.id) ? "Hide Password" : "Show Password"}
                      >
                        {visiblePasswords.has(customer.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {!customer.passwordPlain && visiblePasswords.has(customer.id) && (
                      <div className="text-xs text-red-500 mt-1">Not stored in plain text</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'deactivated' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {customer.status === 'deactivated' ? 'Deactivated' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setCustomerToToggle(customer)}
                      className={`text-indigo-600 hover:text-indigo-900 mr-4`}
                      title={customer.status === 'deactivated' ? "Activate User" : "Deactivate User"}
                    >
                      {customer.status === 'deactivated' ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <button
                      onClick={() => setCustomerToDelete(customer)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.username}? They will no longer be able to log in.`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setCustomerToDelete(null)}
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={!!customerToToggle}
        title={customerToToggle?.status === 'deactivated' ? "Activate Customer" : "Deactivate Customer"}
        message={`Are you sure you want to ${customerToToggle?.status === 'deactivated' ? 'activate' : 'deactivate'} ${customerToToggle?.username}?`}
        confirmText={customerToToggle?.status === 'deactivated' ? "Yes, Activate" : "Yes, Deactivate"}
        cancelText="Cancel"
        onConfirm={toggleStatus}
        onCancel={() => setCustomerToToggle(null)}
        isDestructive={customerToToggle?.status !== 'deactivated'}
      />
    </div>
  );
}

import axios from 'axios';
import { Eye, EyeOff, Loader2, UserX, Trash2, Power, PowerOff } from 'lucide-react';
import Toast, { ToastType } from '../Toast';
import ConfirmModal from '../ConfirmModal';

interface Customer {
  id: string;
  email: string;
  username: string;
  passwordPlain?: string;
  profileImage?: string;
  status?: 'active' | 'deactivated' | 'deleted_by_admin' | 'deleted_by_user';
  createdAt: string;
}

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customerToToggle, setCustomerToToggle] = useState<Customer | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/generate')[0] : 'http://localhost:5001/api';
      const response = await axios.get(`${baseUrl}/admin/users`);
      if (response.data.success) {
        const activeUsers = response.data.users.filter((u: Customer) => u.status !== 'deleted_by_admin' && u.status !== 'deleted_by_user');
        const sortedUsers = activeUsers.sort((a: Customer, b: Customer) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setCustomers(sortedUsers);
      }
    } catch (error) {
      setToast({ message: 'Failed to fetch customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!customerToToggle) return;
    try {
      const newStatus = customerToToggle.status === 'deactivated' ? 'active' : 'deactivated';
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/generate')[0] : 'http://localhost:5001/api';
      const res = await axios.put(`${baseUrl}/admin/users/${customerToToggle.id}/status`, { status: newStatus });
      if (res.data.success) {
        setToast({ message: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, type: 'success' });
        setCustomerToToggle(null);
        fetchCustomers();
      }
    } catch (err) {
      setToast({ message: 'Failed to update user status', type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!customerToDelete) return;
    try {
      const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.split('/generate')[0] : 'http://localhost:5001/api';
      const res = await axios.delete(`${baseUrl}/admin/users/${customerToDelete.id}`);
      if (res.data.success) {
        setToast({ message: 'User deleted successfully', type: 'success' });
        setCustomerToDelete(null);
        fetchCustomers();
      }
    } catch (err) {
      setToast({ message: 'Failed to delete user', type: 'error' });
    }
  };

  const togglePassword = (customerId: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Registered Customers
        </h3>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
          Total: {customers.length}
        </span>
      </div>

      {customers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center">
          <UserX className="h-12 w-12 mb-4 text-gray-300" />
          <p>No customers found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Password
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {customer.profileImage ? (
                        <img src={customer.profileImage} alt={customer.username} className="h-8 w-8 rounded-full object-cover mr-3 border border-indigo-100" />
                      ) : (
                        <img src={`https://ui-avatars.com/api/?name=${customer.username}&background=6366f1&color=fff&bold=true`} alt={customer.username} className="h-8 w-8 rounded-full border border-indigo-100 mr-3" />
                      )}
                      {customer.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded w-32 truncate">
                        {visiblePasswords.has(customer.id)
                          ? (customer.passwordPlain || '********')
                          : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePassword(customer.id)}
                        className="text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                        title={visiblePasswords.has(customer.id) ? "Hide Password" : "Show Password"}
                      >
                        {visiblePasswords.has(customer.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {!customer.passwordPlain && visiblePasswords.has(customer.id) && (
                      <div className="text-xs text-red-500 mt-1">Not stored in plain text</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(customer.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.status === 'deactivated' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {customer.status === 'deactivated' ? 'Deactivated' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setCustomerToToggle(customer)}
                      className={`text-indigo-600 hover:text-indigo-900 mr-4`}
                      title={customer.status === 'deactivated' ? "Activate User" : "Deactivate User"}
                    >
                      {customer.status === 'deactivated' ? <Power size={18} /> : <PowerOff size={18} />}
                    </button>
                    <button
                      onClick={() => setCustomerToDelete(customer)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={!!customerToDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.username}? They will no longer be able to log in.`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setCustomerToDelete(null)}
        isDestructive={true}
      />

      <ConfirmModal
        isOpen={!!customerToToggle}
        title={customerToToggle?.status === 'deactivated' ? "Activate Customer" : "Deactivate Customer"}
        message={`Are you sure you want to ${customerToToggle?.status === 'deactivated' ? 'activate' : 'deactivate'} ${customerToToggle?.username}?`}
        confirmText={customerToToggle?.status === 'deactivated' ? "Yes, Activate" : "Yes, Deactivate"}
        cancelText="Cancel"
        onConfirm={toggleStatus}
        onCancel={() => setCustomerToToggle(null)}
        isDestructive={customerToToggle?.status !== 'deactivated'}
      />
    </div>
  );
}
