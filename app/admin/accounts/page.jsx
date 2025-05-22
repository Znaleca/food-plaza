'use client';

import React, { useEffect, useState } from 'react';
import UsersCard from '@/components/UsersCard';
import getAllUsers from '@/app/actions/getAllUsers';

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getAllUsers();
        setUsers(userData);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Header */}
      <div className="mt-12 sm:mt-16 text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-yellow-500 font-light tracking-widest uppercase">
          Admin
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">
          All Users
        </p>
      </div>

      {/* User Cards */}
      <div className="p-6">
        {users.length === 0 ? (
          <p className="text-center text-neutral-400">No users found.</p>
        ) : (
          <UsersCard users={users} />
        )}
      </div>
    </div>
  );
};

export default AllUsersPage;
