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
          getAllUsers(),
        ]);

        if (!reservationData || reservationData.error) {
          throw new Error(reservationData?.error || 'Failed to fetch reservations');
        }

        if (!userData || userData.error) {
          throw new Error(userData?.error || 'Failed to fetch users');
        }

        const sortedReservations = reservationData.sort(
          (a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
        );

        setReservations(sortedReservations);
        setUsers(userData);
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

  const statusCounts = reservations.reduce((acc, res) => {
    const status = res.status || 'Pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

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

  const groupedByDate = reservations.reduce((acc, res) => {
    const dateKey = moment(res.check_in).format('YYYY-MM-DD');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(res);
    return acc;
  }, {});

  const statusChartData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: 'Reservation Status',
        data: Object.values(statusCounts),
        backgroundColor: ['#facc15', '#10b981', '#f87171', '#6366f1'],
        borderWidth: 1,
      },
    ],
  };

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
      const status =
      res.status === 'approved'
        ? { label: 'Approved', color: 'bg-green-500' }
        : res.status === 'declined'
        ? { label: 'Declined', color: 'bg-red-500' }
        : { label: res.status ? res.status.charAt(0).toUpperCase() + res.status.slice(1) : 'Pending', color: 'bg-yellow-500' };
    

      return (
        <div
          key={res.$id}
          className="bg-neutral-800 border border-neutral-700 rounded-2xl p-5 shadow hover:shadow-yellow-500/20 transition-shadow"
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-white">
                {res.room_id?.name || 'Unnamed Stall'}
              </h3>
              <p className="text-sm text-neutral-400">
                Stall #{res.room_id?.stallNumber || 'N/A'}
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${status.color} text-white`}
            >
              {status.label}
            </span>
          </div>
          <div className="text-sm text-neutral-300 space-y-1 mt-2">
            <p>
              <span className="font-medium text-neutral-400">Check-in:</span>{' '}
              {moment(res.check_in).format('MMM D, YYYY • h:mm A')}
            </p>
            <p>
              <span className="font-medium text-neutral-400">Check-out:</span>{' '}
              {moment(res.check_out).format('MMM D, YYYY • h:mm A')}
            </p>
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
