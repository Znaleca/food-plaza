'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { createAdminClient } from '@/config/appwrite';

const AcceptTeamPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const { account, teams } = createAdminClient();

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const users = await account.listUsers();
        const pending = users.users.filter(user => user.labels.includes('pending'));
        setPendingUsers(pending);
      } catch (error) {
        console.error('Error fetching pending users:', error);
      }
    };

    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, role) => {
    try {
      const teamIdMap = {
        admin: process.env.NEXT_PUBLIC_APPWRITE_TEAM_ADMIN,
        foodstall: process.env.NEXT_PUBLIC_APPWRITE_TEAM_FOODSTALL,
        customer: process.env.NEXT_PUBLIC_APPWRITE_TEAM_CUSTOMER,
      };

      if (teamIdMap[role]) {
        await teams.createMembership(teamIdMap[role], userId, []);
        toast.success('User approved and added to the team!');
      }

      setPendingUsers(prev => prev.filter(user => user.$id !== userId));
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user.');
    }
  };

  const handleDecline = async (userId) => {
    try {
      await account.deleteUser(userId);
      toast.success('User declined and removed.');
      setPendingUsers(prev => prev.filter(user => user.$id !== userId));
    } catch (error) {
      console.error('Error declining user:', error);
      toast.error('Failed to decline user.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
        {pendingUsers.length === 0 ? (
          <p>No pending users.</p>
        ) : (
          <ul>
            {pendingUsers.map(user => (
              <li key={user.$id} className="mb-4 p-4 border rounded-lg">
                <p><strong>Nickname:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.labels.find(label => label !== 'pending')}</p>
                <div className="flex gap-2 mt-2">
                  <button className="bg-green-500 text-white px-4 py-2 rounded-lg" onClick={() => handleApprove(user.$id, user.labels.find(label => label !== 'pending'))}>Approve</button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => handleDecline(user.$id)}>Decline</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AcceptTeamPage;
