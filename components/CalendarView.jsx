'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import getAllReservations from '@/app/actions/getAllReservations';
import { Spinner,Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const localizer = momentLocalizer(moment);

const ReservationsCalendarPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH); // Set default view to 'Month'
  const [showDatePicker, setShowDatePicker] = useState(false); // State to control the DatePicker visibility

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
      id: booking.$id, // Unique ID per booking
      title: booking.room_id?.name || 'Unknown Room',
      start: new Date(booking.check_in),
      end: new Date(booking.check_out),
      resource: booking, // Store the full booking details
    }));
    

    const eventStyleGetter = (event) => {
      const colors = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7'];
      const roomIndex = event.resource?.room_id?.$id.charCodeAt(0) % colors.length;
      const backgroundColor = colors[roomIndex];
    
      return {
        style: {
          backgroundColor,
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

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateBack = () => {
    const newDate = moment(currentDate).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = moment(currentDate).add(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setCurrentDate(newDate);
  };

  const changeView = (newView) => {
    setView(newView);
  };

  const handleDateChange = (date) => {
    setCurrentDate(date);
    setShowDatePicker(false); // Hide the DatePicker once a date is selected
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white bg-blue-400 p-4 rounded-lg shadow-lg">
        Lease Calendar
      </h1>

      {/* Navigation and Search Date */}
      <div className="flex justify-between mb-4">
        <div>
          <Button variant="primary" onClick={navigateToToday} className="hover:bg-blue-600 transition duration-200">

          </Button>
          <Button variant="secondary" className="ml-2 hover:bg-gray-600 transition duration-200" onClick={navigateBack}>

          </Button>
          <Button variant="secondary" className="ml-2 hover:bg-gray-600 transition duration-200" onClick={navigateNext}>
  
          </Button>
        </div>
        <div>
          <Button variant={view === Views.MONTH ? 'dark' : 'light'} onClick={() => changeView(Views.MONTH)} className="ml-2 hover:bg-gray-300 transition duration-200">
    
          </Button>
          <Button variant={view === Views.WEEK ? 'dark' : 'light'} className="ml-2 hover:bg-gray-300 transition duration-200" onClick={() => changeView(Views.WEEK)}>
      
          </Button>
          <Button variant={view === Views.DAY ? 'dark' : 'light'} className="ml-2 hover:bg-gray-300 transition duration-200" onClick={() => changeView(Views.DAY)}>
         
          </Button>
          <Button variant={view === Views.AGENDA ? 'dark' : 'light'} className="ml-2 hover:bg-gray-300 transition duration-200" onClick={() => changeView(Views.AGENDA)}>
          
          </Button>
        </div>
      </div>

      {/* Date Picker search bar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Search Date</label>
        <div className="relative">
          <input
            type="text"
            placeholder="Select Date"
            className="mt-2 p-2 w-full border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowDatePicker(!showDatePicker)} // Toggle DatePicker visibility
            value={moment(currentDate).format('MM/DD/YYYY')}
            readOnly
          />
          {showDatePicker && (
            <DatePicker
              selected={currentDate}
              onChange={handleDateChange}
              inline
              dateFormat="MM/dd/yyyy"
              className="absolute mt-2 p-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      <div className="rounded-lg shadow-lg overflow-hidden bg-white" style={{ height: '400px' }}>
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
  popup // Ensures clicking on an event shows details even when stacked
/>

      </div>

      {showModal && selectedEvent && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full border-4 border-yellow-400 relative ticket-style">
      {/* Close Button */}
      <button 
        onClick={handleCloseModal} 
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-2xl"
      >
        &times;
      </button>

      {/* Ticket Header */}
      <h2 className="text-2xl font-bold text-center text-gray-800 border-b-2 border-dashed border-gray-300 pb-3 mb-4">
        Lease Ticket
      </h2>

      {/* Ticket Content */}
      <div className="space-y-3 text-gray-700">
        <p className="flex justify-between border-b border-dashed pb-2">
          <span className="font-semibold">Title:</span> <span>{selectedEvent.title}</span>
        </p>
        <p className="flex justify-between border-b border-dashed pb-2">
          <span className="font-semibold">Stall #:</span> <span>{selectedEvent.resource?.room_id?.stallNumber || 'N/A'}</span>
        </p>
        <p className="flex justify-between border-b border-dashed pb-2">
          <span className="font-semibold">Start:</span> <span>{selectedEvent.start.toLocaleString()}</span>
        </p>
        <p className="flex justify-between border-b border-dashed pb-2">
          <span className="font-semibold">End:</span> <span>{selectedEvent.end.toLocaleString()}</span>
        </p>
        <p className="flex justify-between">
          <span className="font-semibold">Payment Status:</span> <span>{selectedEvent.resource?.status || 'Unknown'}</span>
        </p>
      </div>

      {/* Ticket Footer (Close Button) */}
      <button 
        onClick={handleCloseModal} 
        className="w-full mt-5 bg-blue-400 hover:bg-yellow-400 text-white font-medium py-2 rounded-lg transition duration-200"
      >
        Close
      </button>
    </div>
  </div>
)}


    </div>
  );
};

export default ReservationsCalendarPage;
