'use client';

import React from 'react';
import Heading from '@/components/Heading';

const UsersCard = ({ users, loading, error }) => {
  if (loading) {
    return <div className="loading text-center p-4 text-gray-600">Loading users...</div>;
  }

  if (error) {
    return <div className="error text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="users-container p-6 bg-gray-50 min-h-screen">
      <Heading title="Users" />
      {users.length === 0 ? (
        <p className="text-center text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border-2 border-pink-600 mb-6">
          <table className="min-w-full table-auto">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">Creation Date</th>
                <th className="px-6 py-4 text-left font-semibold">Teams</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.$id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-6 py-4">{user.name || 'Unnamed User'}</td>
                  <td className="px-6 py-4">{user.email || 'No Email'}</td>
                  <td className="px-6 py-4">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    {user.teams.length > 0
                      ? user.teams.join(', ')
                      : 'No Team'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersCard;
