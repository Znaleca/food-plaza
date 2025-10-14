'use client';

import React from 'react';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const FoodStallLeaseCard = ({ reservations }) => {
  return (
    <div className="mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-6">
        {Array.isArray(reservations) && reservations.length > 0 ? (
          reservations.map((res) => {
            const status =
              res.status === 'approved'
                ? { label: 'Approved', color: 'bg-green-500' }
                : res.status === 'declined'
                ? { label: 'Declined', color: 'bg-red-500' }
                : {
                    label: res.status
                      ? res.status.charAt(0).toUpperCase() + res.status.slice(1)
                      : 'Pending',
                    color: 'bg-yellow-500',
                  };

            const startDate = moment(res.check_in);
            const endDate = moment(res.check_out);
            const totalDuration = endDate.diff(startDate, 'days');
            const remainingDays = endDate.diff(moment(), 'days');
            const leaseStatus =
              remainingDays > 0
                ? `${remainingDays} days left`
                : remainingDays === 0
                ? 'Lease Ending Today'
                : 'Lease Expired';

            const dateLabels = [];
            const leaseData = [];
            for (let i = 0; i <= totalDuration; i++) {
              const currentDate = startDate.clone().add(i, 'days');
              dateLabels.push(currentDate.format('MMM D'));
              leaseData.push(i < remainingDays ? 100 : 0); // Showing remaining lease as 100% and expired as 0%
            }

            const data = {
              labels: dateLabels,
              datasets: [
                {
                  label: 'Lease Duration',
                  data: leaseData,
                  fill: false,
                  borderColor: remainingDays > 0 ? 'rgb(34, 197, 94)' : 'rgb(220, 38, 38)',
                  backgroundColor: remainingDays > 0 ? 'rgb(34, 197, 94)' : 'rgb(220, 38, 38)',
                  tension: 0.1,
                  borderWidth: 2,
                },
              ],
            };

            const options = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: () => '',
                    label: (tooltipItem) => `${tooltipItem.raw === 100 ? 'Active' : 'Expired'}`,
                  },
                },
              },
              scales: {
                x: {
                  ticks: { font: { size: 12 } },
                  grid: { display: false },
                },
                y: {
                  ticks: { display: false },
                  grid: { display: false },
                  min: 0,
                  max: 100,
                },
              },
            };

            return (
              <div
                key={res.$id}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-semibold text-white">
                      {/* FIX: Use res.room?.name */}
                      {res.room?.name || 'Unnamed Stall'}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      {/* FIX: Use res.room?.stallNumber */}
                      Stall #{res.room?.stallNumber || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${status.color} text-white`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="text-sm text-neutral-300 space-y-2 mt-3">
                  <p>
                    <span className="font-medium text-neutral-400">Lease Status:</span>{' '}
                    {leaseStatus}
                  </p>
                  <div className="h-80 w-full mt-4">
                    <Line data={data} options={options} />
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-neutral-400">
                    <span>{startDate.format('MMM D, YYYY')}</span>
                    <span>{endDate.format('MMM D, YYYY')}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-white">No reservations available</div>
        )}
      </div>
    </div>
  );
};

export default FoodStallLeaseCard;