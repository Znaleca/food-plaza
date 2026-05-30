'use client';

import React from 'react';

const UsersCard = ({ users, loading, error }) => {
  if (loading) {
    return <div className="border-2 border-dashed border-neutral-400 px-6 py-10 text-center text-xs font-black uppercase tracking-widest text-neutral-500">Loading users...</div>;
  }

  if (error) {
    return <div className="border-2 border-neutral-950 bg-white px-6 py-5 text-sm font-bold text-red-600 shadow-[4px_4px_0px_#000]">{error}</div>;
  }

  return (
    <div className="w-full text-neutral-950">
      {users.length === 0 ? (
        <div className="border-2 border-dashed border-neutral-400 px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
          No users found.
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full border-4 border-neutral-950 bg-white text-sm shadow-[6px_6px_0px_#000] sm:text-base">
            <thead className="bg-neutral-950 text-white">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-black uppercase tracking-[0.35em] whitespace-nowrap">Name</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-black uppercase tracking-[0.35em] whitespace-nowrap">Email</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-black uppercase tracking-[0.35em] whitespace-nowrap">Creation Date</th>
                <th className="px-4 sm:px-6 py-4 text-left text-xs font-black uppercase tracking-[0.35em] whitespace-nowrap">Labels</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-neutral-950">
              {users.map((user) => (
                <tr
                  key={user.$id}
                  className="transition-colors hover:bg-neutral-100"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap font-black uppercase tracking-tight text-neutral-950">{user.name || 'Unnamed User'}</td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-700 whitespace-nowrap">{user.email || 'No Email'}</td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-700 whitespace-nowrap">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-neutral-700 whitespace-nowrap">
                    {user.labels && user.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.labels.map((label) => (
                          <span
                            key={label}
                            className="inline-flex items-center border-2 border-neutral-950 bg-red-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="inline-flex items-center border-2 border-dashed border-neutral-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                        No Label
                      </span>
                    )}
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
