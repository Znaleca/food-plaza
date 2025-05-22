'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import getAllReservations from '@/app/actions/getAllReservations';
import { Spinner, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Heading from './Heading';

const localizer = momentLocalizer(moment);

const ReservationsCalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        if (!data || data.error) {
          throw new Error(data?.error || 'Failed to fetch reservations');
        }
        setReservations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner animation="border" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 mt-4">
        <p>Error: {error}</p>
      </div>
    );

  const events = reservations.map((booking) => ({
    id: booking.$id,
    title: booking.room_id?.name || 'Unknown Room',
    start: new Date(booking.check_in),
    end: new Date(booking.check_out),
    resource: booking,
  }));

  const eventStyleGetter = (event) => {
    const colors = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'];
    const roomIndex = event.resource?.room_id?.$id.charCodeAt(0) % colors.length;
    return {
      style: {
        backgroundColor: colors[roomIndex],
        color: 'white',
        borderRadius: '4px',
        padding: '4px',
        border: 'none',
      },
    };
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const navigateToToday = () => setCurrentDate(new Date());

  const navigateBack = () => {
    const newDate = moment(currentDate).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = moment(currentDate).add(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setCurrentDate(newDate);
  };

  const changeView = (newView) => setView(newView);

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setShowDatePicker(false);
  };

  return (
    <div className="p-4 bg-gray-100 w-full h-screen flex flex-col">
      

      

      {/* Date Picker */}
      <div className="mb-4 w-full max-w-sm">
        <label className="block text-sm font-medium text-gray-700">Search Date</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Select Date"
            className="mt-2 p-2 w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowDatePicker(!showDatePicker)}
            value={moment(currentDate).format('MM/DD/YYYY')}
            readOnly
          />
          {showDatePicker && (
            <div className="absolute z-50 mt-2">
              <DatePicker
                selected={currentDate}
                onChange={handleDateChange}
                inline
                dateFormat="MM/dd/yyyy"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Calendar */}
      <div className="flex-grow rounded-lg shadow-lg overflow-hidden bg-white">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%', background: '#f9fafb' }}
          date={currentDate}
          onNavigate={setCurrentDate}
          view={view}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleEventClick}
          popup
        />
      </div>

      {/* Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl border-4 border-yellow-400 relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold text-center text-gray-800 border-b-2 border-dashed border-gray-300 pb-4 mb-6">
              Lease Ticket
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-lg">
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Stall #:</strong> {selectedEvent.resource?.room_id?.stallNumber || 'N/A'}</p>
              <p><strong>Start:</strong> {selectedEvent.start.toLocaleString()}</p>
              <p><strong>End:</strong> {selectedEvent.end.toLocaleString()}</p>
              <p><strong>Payment Status:</strong> {selectedEvent.resource?.status || 'Unknown'}</p>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={handleCloseModal}
                className="bg-blue-400 hover:bg-yellow-400 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
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
