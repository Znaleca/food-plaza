'use client';

import React from 'react';
import Heading from '@/components/Heading';

const TeamsCard = ({ teams, loading, error }) => {
  if (loading) {
    return (
      <div className="loading text-center p-4 text-gray-600">
        <span>Loading teams...</span>
        {/* You could add a spinner here */}
      </div>
    );
  }

  if (error) {
    return <div className="error text-center text-red-600 p-4">{error}</div>;
  }

  return (
    <div className="users-container p-6 bg-gray-50 min-h-screen">
      <Heading title="Teams" />
      {teams?.length === 0 ? (
        <p className="text-center text-gray-600">No teams found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg border-2 border-pink-600 mb-6">
          <table className="min-w-full table-auto">
            <thead className="bg-black text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Team Name</th>
                <th className="px-6 py-4 text-left font-semibold">Members Count</th>
                <th className="px-6 py-4 text-left font-semibold">Creation Date</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr
                  key={team.$id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-6 py-4">{team.name || 'Unnamed Team'}</td>
                  <td className="px-6 py-4">{team.membersCount || 0}</td>
                  <td className="px-6 py-4">
                    {team.createdAt
                      ? new Date(team.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          second: 'numeric',
                          hour12: true, // 12-hour format for AM/PM
                        })
                      : 'N/A'}
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

export default TeamsCard;
