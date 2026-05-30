'use client';

import React, { useEffect, useState } from 'react';
import getAllReservations from '@/app/actions/getAllReservations';
import getAllUsers from '@/app/actions/getAllUsers';
import moment from 'moment';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const AdminPage = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservationData, userData] = await Promise.all([
          getAllReservations(),
          getAllUsers(10000, 0), // Fetch a large number of users to get all
        ]);

        if (!reservationData || reservationData.error) {
          throw new Error(reservationData?.error || 'Failed to fetch reservations');
        }

        if (!userData || !Array.isArray(userData.users)) {
          throw new Error(userData?.error || 'Failed to fetch users');
        }

        const now = moment();
        const reservationsWithUpdatedStatus = reservationData.map(res => {
          const checkOutMoment = moment(res.check_out);
          // Check if the reservation status is not declined and the check-out date is in the past
          if (res.status !== 'declined' && checkOutMoment.isBefore(now)) {
            return { ...res, status: 'expired' };
          }
          return res;
        });

        const sortedReservations = reservationsWithUpdatedStatus.sort(
          (a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
        );

        setReservations(sortedReservations);
        setUsers(userData.users); // Extract the users array from the returned object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading dashboard...
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

  // ----- STATUS MAPPING -----
  const statusLabels = {
    pending: 'Pending',
    approved: 'Approved',
    declined: 'Declined',
    expired: 'Expired',
  };

  const statusColors = {
    pending: '#facc15', // yellow
    approved: '#10b981', // green
    declined: '#ef4444', // red
    expired: '#6b7280', // gray
  };

  const statusColorsTailwind = {
    pending: 'bg-yellow-500',
    approved: 'bg-green-500',
    declined: 'bg-red-500',
    expired: 'bg-gray-500',
  };

  const statusOrder = Object.keys(statusLabels);

  // Count reservations by status
  const statusCounts = reservations.reduce((acc, res) => {
    const status = (res.status || 'pending').toLowerCase();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Doughnut chart data
  const statusChartData = {
    labels: statusOrder.map((key) => statusLabels[key]),
    datasets: [
      {
        label: 'Reservation Status',
        data: statusOrder.map((key) => statusCounts[key] || 0),
        backgroundColor: statusOrder.map((key) => statusColors[key]),
        borderWidth: 1,
      },
    ],
  };

  // ----- USER GROWTH -----
  const userGrowth = users.reduce((acc, user) => {
    const date = moment(user.createdAt).format('YYYY-MM-DD');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const cumulativeUsers = [];
  let total = 0;
  Object.keys(userGrowth).sort().forEach((date) => {
    total += userGrowth[date];
    cumulativeUsers.push({ date, count: total });
  });

  const userLineChartData = {
    labels: cumulativeUsers.map((item) => item.date),
    datasets: [
      {
        label: 'Total Users Over Time',
        data: cumulativeUsers.map((item) => item.count),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto w-full max-w-none px-3 sm:px-4 lg:px-6 py-6 lg:py-8">
        {/* HERO */}
        <section className="relative overflow-hidden border-4 border-neutral-950 bg-white shadow-[8px_8px_0px_#000] px-5 py-6 sm:px-6 sm:py-8 mb-6">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
                Admin Control Center
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
                Dashboard
              </h1>
              <p className="mt-4 max-w-3xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                Monitor users, leases, and reservation status from one bold, high-contrast control panel.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center border-2 border-neutral-950 bg-neutral-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#dc2626]">
                Live Overview
              </span>
              <span className="inline-flex items-center border-2 border-neutral-950 bg-red-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_#000]">
                {users.length} Users
              </span>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative overflow-hidden border-4 border-neutral-950 bg-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="absolute left-0 top-0 h-full w-3 bg-red-600" />
            <p className="pl-4 text-xs font-black tracking-[0.35em] uppercase text-neutral-500">
              Total Users
            </p>
            <p className="pl-4 mt-4 text-5xl font-black tracking-tighter text-neutral-950">
              {users.length}
            </p>
          </div>

          <div className="relative overflow-hidden border-4 border-neutral-950 bg-neutral-950 p-5 shadow-[6px_6px_0px_#dc2626] text-white">
            <div className="absolute left-0 top-0 h-full w-3 bg-red-600" />
            <p className="pl-4 text-xs font-black tracking-[0.35em] uppercase text-neutral-300">
              Leases
            </p>
            <p className="pl-4 mt-4 text-5xl font-black tracking-tighter text-white">
              {reservations.length}
            </p>
          </div>

          <div className="relative overflow-hidden border-4 border-neutral-950 bg-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="absolute left-0 top-0 h-full w-3 bg-red-600" />
            <p className="pl-4 text-xs font-black tracking-[0.35em] uppercase text-neutral-500">
              Lease Status
            </p>
            <p className="pl-4 mt-4 text-base font-bold text-neutral-700 leading-relaxed max-w-xs">
              Status distribution and user growth are shown below.
            </p>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="border-4 border-neutral-950 bg-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600">
                  Reservations
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight uppercase text-neutral-950">
                  Status Breakdown
                </h2>
              </div>
              <span className="border-2 border-neutral-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-950">
                Doughnut
              </span>
            </div>
            <div className="mx-auto max-w-md">
              <Doughnut data={statusChartData} />
            </div>
          </div>

          <div className="border-4 border-neutral-950 bg-white p-5 shadow-[6px_6px_0px_#000]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600">
                  Users
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight uppercase text-neutral-950">
                  Growth Over Time
                </h2>
              </div>
              <span className="border-2 border-neutral-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-neutral-950">
                Line
              </span>
            </div>
            <div className="mx-auto max-w-xl">
              <Line data={userLineChartData} />
            </div>
          </div>
        </div>

        {/* RESERVATION SCHEDULE */}
        <section className="border-t-4 border-neutral-950 pt-6">
          <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600">
                Reservation Schedule
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tighter uppercase text-neutral-950">
                Active Lease Cards
              </h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-neutral-600">
              Each card shows the stall name, stall number, and current lease status in a clean, high-contrast layout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reservations.map((res) => {
            const key = (res.status || 'pending').toLowerCase();
            const status = {
              label: statusLabels[key] || 'Pending',
              color: statusColorsTailwind[key] || 'bg-yellow-500',
            };

            return (
              <div
                key={res.$id}
                className="group relative overflow-hidden border-4 border-neutral-950 bg-white p-6 shadow-[6px_6px_0px_#000] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className={`absolute top-0 left-0 h-full w-3 ${status.color}`} />
                <div className="absolute right-0 top-0 h-3 w-24 bg-neutral-950 group-hover:bg-red-600 transition-colors" />

                <div className="pl-4">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600 mb-2">
                        Stall
                      </p>
                      <h3 className="text-2xl font-black tracking-tight text-neutral-950 uppercase leading-tight">
                        {res.room?.name || 'Unnamed Stall'}
                      </h3>
                      <p className="mt-2 text-sm font-bold uppercase tracking-wider text-neutral-500">
                        Stall #{res.room?.stallNumber || 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center border-2 border-neutral-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-white ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="border-t-2 border-neutral-950 pt-4 text-sm text-neutral-700 space-y-3">
                    <p>
                      <span className="font-black uppercase tracking-widest text-neutral-950">Start:</span>{' '}
                      {moment(res.check_in).format('MMM D, YYYY • h:mm A')}
                    </p>
                    <p>
                      <span className="font-black uppercase tracking-widest text-neutral-950">End:</span>{' '}
                      {moment(res.check_out).format('MMM D, YYYY • h:mm A')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminPage;