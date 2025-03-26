// src/pages/admin/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../../axios';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 5;
  const indexOfLast = currentPage * eventsPerPage;
  const indexOfFirst = indexOfLast - eventsPerPage;
  const currentEvents = events.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const getEventStatus = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  
    if (eventDateTime > now) {
      return 'Upcoming';
    } else if (
      eventDateTime.toDateString() === now.toDateString() &&
      Math.abs(eventDateTime.getHours() - now.getHours()) <= 1 // you can tweak this logic
    ) {
      return 'Ongoing';
    } else {
      return 'Finished';
    }
  };

  
  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
 

  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await axios.get('/sanctum/csrf-cookie');
        const response = await axios.get('/admin/show');
        setEvents(response.data.events);
      } catch (err) {
        console.error('Failed to fetch events:', err.response || err.message);
      }
    };

    fetchEvents();
  }, []);

  const totalEvents = events.length;
  const totalBookings = events.reduce((sum, event) => sum + (event.bookings_count), 0);
  const eventsNearingCapacity = events.filter(event => {
    const booked = event.bookings_count;
    return event.capacity > 0 && (event.capacity - booked <= 1);
  });
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r p-6 fixed left-0 top-0 z-40">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Panel</h2>
        <nav className="space-y-4">
          <Link
            to="/admin/events"
            className={`block w-full text-left px-4 py-2 rounded font-medium ${
              location.pathname === '/admin/events' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Events
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 rounded font-medium text-red-600 hover:bg-red-100"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-6">
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold text-gray-600">Total Events</h2>
            <p className="text-3xl font-bold text-blue-600">{totalEvents}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold text-gray-600">Events Nearing Capacity</h2>
            <p className="text-3xl font-bold text-yellow-500">{eventsNearingCapacity.length}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-semibold text-gray-600">Total Bookings</h2>
            <p className="text-3xl font-bold text-green-600">{totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Bookings per Event</h2>
          <table className="w-full text-left border border-gray-200 rounded overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b">Event</th>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Location</th>
                <th className="p-3 border-b text-center">Bookings</th>
                <th className="p-3 border-b text-center">Capacity</th>
                <th className="p-3 border-b text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map(event => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b font-medium text-blue-700">{event.title}</td>
                  <td className="p-3 border-b">{event.date}</td>
                  <td className="p-3 border-b">{event.location}</td>
                  <td className="p-3 border-b text-center">{event.bookings_count}</td>
                  <td className="p-3 border-b text-center">{event.capacity}</td>
                  <td className="p-3 border-b text-center">
                  {(() => {
                    const timeStatus = getEventStatus(event.date, event.time);

                    if (timeStatus === 'Finished') {
                      return <span className="text-gray-500 font-semibold">Finished</span>;
                    }

                    // Show booking status (Open / Full) + time status
                    return (
                      <div className="flex flex-col items-center space-y-1">
                        {event.bookings_count >= event.capacity ? (
                          <span className="text-red-500 font-semibold">Fully Booked</span>
                        ) : (
                          <span className="text-green-600 font-semibold">Open</span>
                        )}
                        <span className={
                          timeStatus === 'Upcoming' ? 'text-blue-500' :
                          timeStatus === 'Ongoing' ? 'text-yellow-500' :
                          'text-gray-500'
                        }>
                          {timeStatus}
                        </span>
                      </div>
                    );
                  })()}
                  </td>
                </tr>
              ))}
            </tbody>
            <div className="flex justify-left items-center mt-6 w-full">
              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded border text-sm ${
                      currentPage === idx + 1
                        ? 'bg-blue-600 text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 rounded border text-sm bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
