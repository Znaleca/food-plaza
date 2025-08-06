'use client';

import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import getAllReservations from '@/app/actions/getAllReservations';

const ReservationsCalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);

  const calendarRef = useRef(null);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        if (!data || data.error) throw new Error(data?.error || 'Failed to fetch reservations');
        setReservations(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchReservations();
  }, []);

  const startOfMonth = currentDate.clone().startOf('month').startOf('week');
  const endOfMonth = currentDate.clone().endOf('month').endOf('week');
  const day = startOfMonth.clone().subtract(1, 'day');
  const calendar = [];

  while (day.isBefore(endOfMonth, 'day')) {
    calendar.push(
      Array(7)
        .fill(0)
        .map(() => day.add(1, 'day').clone())
    );
  }

  const eventsByDay = reservations.reduce((acc, booking) => {
    const date = moment(booking.check_in).format('YYYY-MM-DD');
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  const goToPrevMonth = () => setCurrentDate(currentDate.clone().subtract(1, 'month'));
  const goToNextMonth = () => setCurrentDate(currentDate.clone().add(1, 'month'));

  const handleDateClick = (date) => {
    const formatted = date.format('YYYY-MM-DD');
    setSelectedDate(date);
    setSelectedDateEvents(eventsByDay[formatted] || []);
    setShowModal(true);
  };

  const handleDateChange = (date) => {
    setCurrentDate(moment(date));
    setShowDatePicker(false);
  };

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white px-4 py-12 sm:px-10">
      <div className="text-center mb-8">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-widest">LEASE MAP</h1>
        <p className="mt-4 text-lg sm:text-xl mb-20 font-light text-gray-400">
          View Food Stall Lease like a traditional calendar layout.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center max-w-4xl mx-auto gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button onClick={goToPrevMonth} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">
            ← Prev
          </button>
          <h2 className="text-xl font-semibold text-gray-200">{currentDate.format('MMMM YYYY')}</h2>
          <button onClick={goToNextMonth} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md">
            Next →
          </button>
        </div>

        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            onClick={() => setShowDatePicker(!showDatePicker)}
            value={currentDate.format('MM/DD/YYYY')}
            readOnly
            className="bg-neutral-800 text-white border border-neutral-700 rounded-md px-4 py-2 w-full sm:w-48 cursor-pointer"
          />
          {showDatePicker && (
            <div className="absolute z-50 mt-2">
              <DatePicker selected={currentDate.toDate()} onChange={handleDateChange} inline />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 max-w-4xl mx-auto text-center mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
          <div key={idx} className="text-yellow-400 font-semibold text-sm sm:text-base">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 max-w-4xl mx-auto" ref={calendarRef}>
        {calendar.map((week, i) =>
          week.map((date, idx) => {
            const isToday = date.isSame(moment(), 'day');
            const isCurrentMonth = date.isSame(currentDate, 'month');
            const dateKey = date.format('YYYY-MM-DD');
            const dayEvents = eventsByDay[dateKey] || [];

            return (
              <div
                key={`${i}-${idx}`}
                data-day={dateKey}
                onClick={() => handleDateClick(date)}
                className={`cursor-pointer border rounded-md p-2 text-sm sm:text-base h-32 sm:h-36 flex flex-col justify-between overflow-hidden transition ${
                  isCurrentMonth ? 'bg-neutral-800' : 'bg-neutral-700 text-gray-500'
                } ${isToday ? 'border-yellow-500' : 'border-neutral-700'} hover:ring-2 hover:ring-yellow-500`}
              >
                <div className="font-semibold">{date.date()}</div>
                <div className="flex-grow mt-2 overflow-auto">
                  {dayEvents.length > 0 ? (
                    <ul className="text-xs space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <li key={event.$id} className="text-yellow-400 truncate">
                          • {event.room_id?.name || 'Stall'} #{event.room_id?.stallNumber}
                        </li>
                      ))}
                      {dayEvents.length > 2 && (
                        <li className="text-gray-400 italic">+{dayEvents.length - 2} more</li>
                      )}
                    </ul>
                  ) : (
                    <span className="text-neutral-500 italic text-xs">No events</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="relative w-full max-w-2xl bg-neutral-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-yellow-600">
      {/* Close Button */}
      <button
        onClick={() => setShowModal(false)}
        className="absolute top-4 right-4 text-white hover:text-yellow-500 text-2xl sm:text-3xl"
      >
        &times;
      </button>

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-yellow-400 tracking-wide">
        Lease for {selectedDate?.format('MMMM D, YYYY')}
      </h2>

      {/* Lease Entries */}
      {selectedDateEvents.length > 0 ? (
        <div className="space-y-5 max-h-[28rem] overflow-y-auto pr-1">
          {selectedDateEvents.map((event) => {
            const start = moment(event.check_in);
            const end = moment(event.check_out);
            const durationDays = end.diff(start, 'days');
            const durationMonths = end.diff(start, 'months');
            const widthPercent = Math.min((durationDays / 365) * 100, 100);

            // Determine badge color
            const status = event.status?.toUpperCase() || 'UNKNOWN';
            const statusStyles = {
              PENDING: 'text-yellow-400 border-yellow-400 bg-yellow-900/30',
              APPROVED: 'text-green-400 border-green-400 bg-green-900/30',
              DECLINED: 'text-red-400 border-red-400 bg-red-900/30',
              UNKNOWN: 'text-gray-400 border-gray-400 bg-gray-900/30',
            };

            const badgeClass = statusStyles[status] || statusStyles.UNKNOWN;

            return (
              <div
                key={event.$id}
                className="bg-neutral-800 border border-neutral-700 rounded-xl p-4 shadow-md flex flex-col gap-4"
              >
                {/* Stall + Status */}
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <p className="text-lg font-semibold text-yellow-300">
                    {event.room_id?.name} #{event.room_id?.stallNumber}
                  </p>
                  <span
                    className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${badgeClass} tracking-wide`}
                  >
                    {status}
                  </span>
                </div>

                {/* Duration */}
                <div className="text-sm text-gray-300">
                  <strong>Duration:</strong>{' '}
                  {durationMonths >= 1
                    ? `${durationMonths} month${durationMonths > 1 ? 's' : ''}`
                    : `${durationDays} day${durationDays > 1 ? 's' : ''}`}
                </div>

                {/* Timeline */}
                <div className="relative h-6 bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${widthPercent}%` }}
                  />
                  <div className="absolute inset-0 flex justify-between text-xs text-white px-2 mt-1">
                    <span>{start.format('MMM D, YYYY')}</span>
                    <span>{end.format('MMM D, YYYY')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-400 italic text-lg mt-8">
          No Lessee on this date.
        </p>
      )}

      {/* Close Button */}
      <div className="mt-10 text-center">
        <button
          onClick={() => setShowModal(false)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-8 rounded-xl transition-all duration-200 shadow-md"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default ReservationsCalendarPage;
