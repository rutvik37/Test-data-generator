import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, LogOut } from 'lucide-react';
import ConfirmModal from '../ConfirmModal';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  useEffect(() => {
    document.title = 'Admin Portal';
    const isAdmin = localStorage.getItem('ai-test-data-admin');
    if (!isAdmin) {
      navigate('/admin');
    }
    return () => { document.title = 'Test data generator'; };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('ai-test-data-admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-indigo-800">
          <Shield className="h-6 w-6 mr-2 text-indigo-400" />
          <span className="text-lg font-bold">Admin Portal</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          <button className="w-full flex items-center px-4 py-3 bg-indigo-800 text-white rounded-lg transition-colors">
            <Users className="h-5 w-5 mr-3" />
            <span className="font-medium">Customers</span>
          </button>
          {/* Future modules can be added here */}
        </div>

        <div className="p-4 border-t border-indigo-800">
          <button 
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full flex items-center px-4 py-2 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center px-8 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Customers Dashboard</h1>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          {children}
        </main>
      </div>

      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        title="Admin Logout"
        message="Are you sure you want to log out from the Admin Portal?"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
}
