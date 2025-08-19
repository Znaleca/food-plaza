'use client';

import React, { useEffect, useState } from 'react';
import UsersCard from '@/components/UsersCard';
import getAllUsers from '@/app/actions/getAllUsers';

// Constant for users per page
const USERS_PER_PAGE = 25;

const AllUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const userData = await getAllUsers(USERS_PER_PAGE, page * USERS_PER_PAGE);
        setUsers(userData.users);
        setTotal(userData.total);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]); // Re-fetch data whenever the page number changes

  const handleNextPage = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(0, prevPage - 1));
  };

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
        {users.length === 0 && page === 0 ? (
          <p className="text-center text-neutral-400">No users found.</p>
        ) : (
          <UsersCard users={users} />
        )}
      </div>

      {/* Pagination Controls */}
      {total > USERS_PER_PAGE && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={handlePrevPage}
            disabled={page === 0}
            className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-white flex items-center">
            Page {page + 1} of {Math.ceil(total / USERS_PER_PAGE)}
          </span>
          <button
            onClick={handleNextPage}
            disabled={(page + 1) * USERS_PER_PAGE >= total}
            className="px-4 py-2 bg-neutral-700 text-white rounded-md hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllUsersPage;