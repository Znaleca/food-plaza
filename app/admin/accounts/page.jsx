'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';
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
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-950">
        <div className="border-4 border-neutral-950 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest shadow-[6px_6px_0px_#000]">
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-950 px-4">
        <div className="max-w-lg border-4 border-neutral-950 bg-white px-6 py-5 text-sm font-bold text-red-600 shadow-[6px_6px_0px_#000]">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 hover:text-white"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </Link>

        <section className="relative mt-6 mb-8 overflow-hidden border-4 border-neutral-950 bg-white px-6 py-8 shadow-[8px_8px_0px_#000] sm:px-8 sm:py-10">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />
          <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
            Admin Module
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
            All Users
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
            Browse lessee and admin accounts from a cleaner, high-contrast admin list view.
          </p>
        </section>

        <div className="border-4 border-neutral-950 bg-white p-4 shadow-[8px_8px_0px_#000] sm:p-6">
          {users.length === 0 && page === 0 ? (
            <div className="border-2 border-dashed border-neutral-400 px-6 py-10 text-center text-sm font-bold uppercase tracking-widest text-neutral-500">
              No users found.
            </div>
          ) : (
            <UsersCard users={users} />
          )}
        </div>

        {/* Pagination Controls */}
        {total > USERS_PER_PAGE && (
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
            <button
              onClick={handlePrevPage}
              disabled={page === 0}
              className="border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 hover:text-white disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
            >
              Previous
            </button>
            <span className="border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#dc2626]">
              Page {page + 1} of {Math.ceil(total / USERS_PER_PAGE)}
            </span>
            <button
              onClick={handleNextPage}
              disabled={(page + 1) * USERS_PER_PAGE >= total}
              className="border-2 border-neutral-950 bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllUsersPage;