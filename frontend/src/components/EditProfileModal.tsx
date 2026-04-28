import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, Mail, User as UserIcon, Camera, Trash2 } from 'lucide-react';
import { User } from '../types';
import ConfirmModal from './ConfirmModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdate: (updatedUser: User) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdate }) => {
  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [profileImage, setProfileImage] = useState<string | undefined>(currentUser.profileImage);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
      setProfileImage(currentUser.profileImage);
      setError(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

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

    if (!validateUsername(username)) {
      setError('Username must be 3-20 characters long and can only contain letters, numbers, and underscores.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      const res = await axios.put(`${getApiUrl()}/profile`, { currentEmail: currentUser.email, email, username, profileImage });
      onUpdate(res.data.user);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await axios.delete(`${getApiUrl()}/profile`, { data: { currentEmail: currentUser.email } });
      localStorage.removeItem('ai-test-data-user');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center mb-6">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-md" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-3xl border-4 border-indigo-50 shadow-md">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-8 w-8" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setProfileImage(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">Click to change profile picture</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="johndoe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] mt-2"
            >
              Update Profile
            </button>

            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium py-3 rounded-xl transition-all"
              >
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete Account"
        message="Are you absolutely sure you want to delete your account? This action cannot be undone and you will be logged out."
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={handleDeleteProfile}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
};

export default EditProfileModal;
