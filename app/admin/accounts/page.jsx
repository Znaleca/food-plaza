'use client';

import React, { useEffect, useState } from 'react';
import UsersCard from '@/components/UsersCard';
import TeamsCard from '@/components/TeamsCard'; // Import the TeamsCard
import getAllUsers from '@/app/actions/getAllUsers';
import getAllTeams from '@/app/actions/getAllTeams';

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUsers, setShowUsers] = useState(true); // State to toggle between Users and Teams

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userData, teamData] = await Promise.all([getAllUsers(), getAllTeams()]);
        setUsers(userData);
        setTeams(teamData);
      } catch (err) {
        console.error('Error fetching users or teams:', err);
        setError('Failed to load users or teams.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleView = () => {
    setShowUsers(!showUsers); // Toggle the state between Users and Teams
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Toggle Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={toggleView}
          className="py-2 px-4 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-all duration-300"
        >
          {showUsers ? 'View Teams' : 'View Users'}
        </button>
      </div>

      {/* Content based on showUsers state */}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {loading ? (
          <div className="text-center text-gray-600">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : showUsers ? (
          <UsersCard users={users} loading={loading} error={error} />
        ) : (
          <TeamsCard teams={teams} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
};

export default AllUsersPage;
