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

        const sortedReservations = reservationData.sort(
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
    pending: '#facc15',  // yellow
    approved: '#10b981', // green
    declined: '#ef4444', // red
    expired: '#6b7280',  // gray
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
  Object.keys(userGrowth).sort().forEach(date => {
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
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* HEADER */}
      <div className="text-center mb-12">
        <h2 className="text-yellow-400 uppercase text-lg sm:text-base tracking-widest">Admin</h2>
        <h1 className="text-4xl font-bold mt-2">Dashboard</h1>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-pink-700 to-pink-600 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-white text-xl font-semibold">Total Users</h3>
          <p className="text-3xl mt-2 font-bold text-white">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-white text-xl font-semibold">Leases</h3>
          <p className="text-3xl mt-2 font-bold text-white">{reservations.length}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl p-6 shadow-lg text-center">
          <h3 className="text-white text-xl font-semibold">Lease Status</h3>
          <p className="text-md mt-2 text-neutral-200">See chart below</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
        <div className="mt-10">
          <Doughnut data={statusChartData} />
        </div>
        <div className="mt-10">
          <Line data={userLineChartData} />
        </div>
      </div>

      {/* RESERVATION SCHEDULE */}
      <div className="mt-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reservations.map((res) => {
            const key = (res.status || 'pending').toLowerCase();
            const status = {
              label: statusLabels[key] || 'Pending',
              color: statusColorsTailwind[key] || 'bg-yellow-500',
            };

            return (
              <div
                key={res.$id}
                className="bg-neutral-800 border border-neutral-700 rounded-2xl p-6 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
              >
                {/* Visual marker for the card */}
                <div className={`absolute top-0 left-0 h-full w-2 ${status.color}`}></div>

                <div className="pl-2"> {/* Added padding for the marker */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {res.room_id?.name || 'Unnamed Stall'}
                      </h3>
                      <p className="text-sm text-neutral-400 mt-1">
                        Stall #{res.room_id?.stallNumber || 'N/A'}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold ${status.color} text-white`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="text-sm text-neutral-300 space-y-2 mt-4 border-t border-neutral-700 pt-4">
                    <p>
                      <span className="font-medium text-neutral-400">Start:</span>{' '}
                      {moment(res.check_in).format('MMM D, YYYY • h:mm A')}
                    </p>
                    <p>
                      <span className="font-medium text-neutral-400">End:</span>{' '}
                      {moment(res.check_out).format('MMM D, YYYY • h:mm A')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
