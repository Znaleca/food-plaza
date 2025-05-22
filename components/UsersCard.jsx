'use client';

import React from 'react';

const UsersCard = ({ users, loading, error }) => {
  if (loading) {
    return <div className="text-center text-neutral-400 py-4">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-neutral-900 text-white">
      {users.length === 0 ? (
        <p className="text-center text-neutral-400">No users found.</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-neutral-800 border border-neutral-700 rounded-2xl shadow-md text-sm sm:text-base">
            <thead className="bg-neutral-900 border-b border-yellow-600">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Email</th>
                <th className="px-4 sm:px-6 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Creation Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-yellow-400 font-semibold whitespace-nowrap">Labels</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.$id}
                  className="border-b border-neutral-700 hover:bg-neutral-700 transition-all"
                >
                  <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{user.name || 'Unnamed User'}</td>
                  <td className="px-4 sm:px-6 py-3 text-neutral-300 whitespace-nowrap">{user.email || 'No Email'}</td>
                  <td className="px-4 sm:px-6 py-3 text-neutral-300 whitespace-nowrap">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-neutral-300 whitespace-nowrap">
                    {user.labels && user.labels.length > 0
                      ? user.labels.join(', ')
                      : 'No Label'}
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
