'use client';

import React from 'react';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

const FoodStallLeaseCard = ({ reservations }) => {
  return (
    <div className="mt-20 text-neutral-950 selection:bg-red-600 selection:text-white">
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
              <div key={res.$id} className="border-4 border-neutral-950 bg-white p-4 sm:p-6 shadow-[8px_8px_0px_#000]">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-neutral-950">
                      {/* FIX: Use res.room?.name */}
                      {res.room?.name || 'Unnamed Stall'}
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600 mt-1">
                      {/* FIX: Use res.room?.stallNumber */}
                      Stall #{res.room?.stallNumber || 'N/A'}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-3 py-1 font-black uppercase tracking-[0.16em] border-2 border-neutral-950 ${status.color} text-white shadow-[3px_3px_0px_#000]`}
                  >
                    {status.label}
                  </span>
                </div>
                <div className="text-sm text-neutral-700 space-y-3 mt-3">
                  <p>
                    <span className="font-black uppercase tracking-[0.14em] text-neutral-950">Lease Status:</span>{' '}
                    {leaseStatus}
                  </p>
                  <div className="h-80 w-full mt-4 border-2 border-neutral-950 bg-neutral-50 p-2">
                    <Line data={data} options={options} />
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-neutral-600">
                    <span>{startDate.format('MMM D, YYYY')}</span>
                    <span>{endDate.format('MMM D, YYYY')}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border-4 border-dashed border-neutral-300 bg-white p-6 text-center text-neutral-600 shadow-[8px_8px_0px_#000]">No reservations available</div>
        )}
      </div>
    </div>
  );
};

export default FoodStallLeaseCard;