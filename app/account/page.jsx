'use client';

import { useEffect, useState } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import getCurrentUser from '../actions/getCurrentUser';
import updateUser from '../actions/updateUser';

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const EditableField = ({ label, isEditing, onToggle, children }) => (
  <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 shadow-sm relative">
    <div className="flex justify-between items-center text-neutral-400 mb-1">
      <p className="font-medium">{label}</p>
      <FaRegEdit
        onClick={onToggle}
        className="text-pink-500 cursor-pointer hover:text-pink-400 transition"
        title={`Edit ${label}`}
        aria-label={`Edit ${label}`}
      />
    </div>
    {children}
  </div>
);

const AccountSettings = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchUser() {
      const data = await getCurrentUser();
      setUser(data);
      setFormData({ name: data.name, email: data.email, password: '', confirmPassword: '' });
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (status === 'Profile updated!') {
      const timer = setTimeout(() => setStatus(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEdit = (field) => {
    setEditMode((prev) => {
      const newMode = { ...prev, [field]: !prev[field] };
      if (field === 'password') {
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setStatus('');
      }
      return newMode;
    });
  };

  const validateRules = {
    minLength: /.{8,}/,
    capital: /[A-Z]/,
    number: /[0-9]/,

  };

  const hasChanges = () => {
    if (!user) return false;
    if (formData.name !== user.name) return true;
    if (formData.email !== user.email) return true;
    if (editMode.password && formData.password.length > 0) return true;
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    if (editMode.password) {
      if (formData.password !== formData.confirmPassword) {
        setStatus('Passwords do not match');
        return;
      }
      if (
        !validateRules.minLength.test(formData.password) ||
        !validateRules.capital.test(formData.password) ||
        !validateRules.number.test(formData.password)
      ) {
        setStatus('Password must meet the requirements below');
        return;
      }
    }

    setStatus('Saving...');

    try {
      const form = new FormData();
      form.append('userId', user.$id);
      form.append('name', formData.name);
      form.append('email', formData.email);
      if (formData.password) form.append('password', formData.password);

      const result = await updateUser(null, form);

      if (result.success) {
        setStatus('Profile updated!');
        const refreshedUser = await getCurrentUser();
        setUser(refreshedUser);
        setFormData({
          name: refreshedUser.name,
          email: refreshedUser.email,
          password: '',
          confirmPassword: '',
        });
        setEditMode({ name: false, email: false, password: false });
      } else {
        setStatus(`Error: ${result.error || 'Failed to update profile'}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message || 'Unexpected error'}`);
    }
  };

  const passwordValidationFeedback = () => {
    const rules = [
      { label: 'At least 8 characters', valid: validateRules.minLength.test(formData.password) },
      { label: 'At least 1 capital letter', valid: validateRules.capital.test(formData.password) },
      { label: 'At least 1 number', valid: validateRules.number.test(formData.password) }, 

    ];

    return (
      <ul className="text-sm ml-5 space-y-1">
        {rules.map((rule, i) => (
          <li key={i} className={`list-disc ${rule.valid ? 'text-green-400' : 'text-neutral-400'}`}>
            {rule.label}
          </li>
        ))}
      </ul>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900 text-white">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-white py-20 px-4 sm:px-8">
      <div className="text-center mb-12 px-4 max-w-3xl mx-auto">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          Account Settings
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">
          Manage Your Profile
        </p>
      </div>

      <div className="max-w-3xl mx-auto bg-stone-800 rounded-2xl shadow-xl p-8 sm:p-12 space-y-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base sm:text-lg">
          <EditableField label="Name" isEditing={editMode.name} onToggle={() => toggleEdit('name')}>
            {editMode.name ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-neutral-700 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                autoFocus
                required
              />
            ) : (
              <p className="font-semibold text-white select-text">{user.name}</p>
            )}
          </EditableField>

          <EditableField label="Email" isEditing={editMode.email} onToggle={() => toggleEdit('email')}>
            {editMode.email ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-neutral-700 text-white p-3 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
                autoFocus
                required
              />
            ) : (
              <p className="font-semibold text-white select-text">{user.email}</p>
            )}
          </EditableField>

          <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 shadow-sm">
            <p className="text-neutral-400 mb-1 font-medium">Labels</p>
            <p className="font-semibold text-white select-text">
              {user.labels?.length > 0 ? user.labels.join(', ') : '—'}
            </p>
          </div>

          <EditableField label="Password" isEditing={editMode.password} onToggle={() => toggleEdit('password')}>
            {editMode.password ? (
              <>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="New password"
                  className="w-full bg-neutral-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full bg-neutral-700 text-white p-3 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  required
                />
                {passwordValidationFeedback()}
              </>
            ) : (
              <p className="font-semibold text-white tracking-widest select-none">●●●●●●●●</p>
            )}
          </EditableField>

          <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 shadow-sm">
            <p className="text-neutral-400 mb-1 font-medium">Date Created</p>
            <p className="font-semibold text-white select-text">{formatDate(user.$createdAt)}</p>
          </div>

          <div className="bg-neutral-800 p-5 rounded-xl border border-neutral-700 shadow-sm">
            <p className="text-neutral-400 mb-1 font-medium">User ID</p>
            <p className="font-mono text-pink-500 select-text">{user.$id}</p>
          </div>

          <div className="sm:col-span-2 text-right pt-6">
            {hasChanges() && (
              <button
                type="submit"
                className="px-8 py-3 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 transition"
                aria-label="Save Changes"
              >
                Save Changes
              </button>
            )}
            {status && (
              <p
                className={`mt-3 text-sm text-center ${
                  status.includes('Error') ? 'text-red-500' : 'text-pink-400'
                }`}
                role="alert"
              >
                {status}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
