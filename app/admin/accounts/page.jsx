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

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        {loading ? (
          <div className="text-center text-gray-600">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <UsersCard users={users} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
};

export default AllUsersPage;
