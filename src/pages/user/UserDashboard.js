import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../axios'; // adjust path as needed

const UserDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [reservedEvents, setReservedEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const isUpcoming = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
    return eventDateTime >= now;
  };
  const matchesSearch = (event) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      event.title.toLowerCase().includes(lowerSearch) ||
      event.location.toLowerCase().includes(lowerSearch)
    );
  };
  
  const matchesDate = (event) => {
    return filterDate === '' || event.date === filterDate;
  };
  
  const upcomingEvents = events.filter(event => isUpcoming(event.date, event.time) && matchesSearch(event) && matchesDate(event));
  const pastEvents = events.filter(event => !isUpcoming(event.date, event.time) && matchesSearch(event) && matchesDate(event));
  
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await axios.get('/sanctum/csrf-cookie'); // If using Sanctum
        const response = await axios.get('/user/events');
        setEvents(response.data.events);
        console.log('Data', response);
      } catch (err) {
        console.error('Failed to fetch events:', err.response || err.message);
      }
    };
  
    fetchEvents();
  }, []);
  

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatTime12Hour = (timeString) => {
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(+hour);
    date.setMinutes(+minute);
  
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleReserve = async (event) => {
    if (event.booked >= event.capacity) return;
    if (reservedEvents.includes(event.id)) return;
  
    try {
      await axios.get('/sanctum/csrf-cookie'); // For Sanctum
      const response = await axios.post('/user/reserved', { event_id: event.id });
      console.log(response.data.message);
  
      setReservedEvents([...reservedEvents, event.id]);
      setEvents(events.map(e => e.id === event.id ? { ...e, booked: e.booked + 1 } : e));
    } catch (err) {
      alert(err.response?.data?.message || 'Reservation failed.');
      console.error(err);
    }
  };
  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 h-screen bg-white border-r p-6 fixed left-0 top-0 z-40">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">User Panel</h2>
        <nav className="space-y-4">
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
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full md:w-1/2"
          />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full md:w-1/3"
          />
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
            }}
            className="text-blue-600 underline text-sm"
          >
            Clear Filters
          </button>
        </div>

        {/* Upcoming Events */}
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Upcoming Events</h1>
        <div className="space-y-4 mb-10">
          {upcomingEvents.length === 0 && <p className="text-gray-500">No upcoming events available.</p>}
          {upcomingEvents.map(event => (
            <div key={event.id} className="bg-white p-4 rounded shadow border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-blue-600">{event.title}</h3>
                 <p className="text-sm text-gray-600">{event.date} at {formatTime12Hour(event.time)} • {event.location}</p>
                  <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    {event.booked}/{event.capacity} spots reserved
                  </p>
                </div>
                <div>
                  {event.booked >= event.capacity ? (
                    <span className="text-sm text-red-500 font-semibold">Fully Booked</span>
                  ) : reservedEvents.includes(event.id) ? (
                    <span className="text-sm text-green-500 font-semibold">Reserved</span>
                  ) : (
                    <button
                      onClick={() => handleReserve(event)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Reserve Spot
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Past Events */}
        <h2 className="text-2xl font-bold text-gray-600 mb-4">Past Events</h2>
        <div className="space-y-4">
          {pastEvents.length === 0 && <p className="text-gray-500">No past events.</p>}
          {pastEvents.map(event => (
            <div key={event.id} className="bg-white p-4 rounded shadow border border-gray-200 opacity-70">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-500">{event.title}</h3>
                  <p className="text-sm text-gray-500">{event.date} at {event.time} • {event.location}</p>
                  <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {event.booked}/{event.capacity} spots reserved
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 italic">Event finished</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default UserDashboard;
