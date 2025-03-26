// src/pages/admin/Events.js
import React, { useState, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from '../../axios'; // adjust path as needed

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
      const fetchEvents = async () => {
        try {
          await axios.get('/sanctum/csrf-cookie'); // Needed if using Sanctum
          const response = await axios.get('/admin/show');
          setEvents(response.data.events);
        } catch (err) {
          console.error('Failed to fetch events:', err.response || err.message);
        }
      };
    
      fetchEvents();
    }, []);

  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
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

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    description: ''
  });

  const openModal = (event = null) => {
    setIsModalOpen(true);
    if (event) {
      setIsEdit(true);

      setForm(event);
    } else {
      setIsEdit(false);

      setForm({ title: '', date: '', time: '', location: '', capacity: '', description: '' });
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

  const getEventStatus = (eventDate, eventTime) => {
    const now = new Date();
    const eventDateTime = new Date(`${eventDate}T${eventTime}`);
  
    if (eventDateTime > now) {
      return 'Upcoming';
    } else if (
      eventDateTime.toDateString() === now.toDateString() &&
      eventDateTime.getHours() === now.getHours()
    ) {
      return 'Ongoing';
    } else {
      return 'Finished';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
  
    try {
      await axios.get('/sanctum/csrf-cookie');
  
      if (isEdit && form.id) {
        const response = await axios.put(`/admin/edit/${form.id}`, form);
        // Replace the updated event in state
        setEvents(events.map(ev => ev.id === form.id ? response.data.event : ev));
      } else {
        const response = await axios.post('/admin/events', form);
        setEvents([...events, response.data.event]);
      }
  
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err.response || err.message);
      alert('Failed to save event. Please check your input.');
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this event?');
  
    if (!confirmDelete) return;
  
    try {
      await axios.delete(`/admin/delete/${id}`);
      setEvents(events.filter(ev => ev.id !== id));
      // Optional toast if you're using react-toastify
      // toast.success('Event deleted successfully');
    } catch (err) {
      console.error('Failed to delete event:', err.response || err.message);
      alert('Failed to delete event. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? event.date === filterDate : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="ml-64 p-6">
      <aside className="w-64 h-screen bg-white border-r p-6 fixed left-0 top-0 z-40">
                  <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Panel</h2>
                  <nav className="space-y-4">
                    <Link
                        to="/admin"
                        className={`block w-full text-left px-4 py-2 rounded font-medium ${
                          location.pathname === '/admin' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Dashboard
                    </Link>
                    
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">Events</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Add Event
        </button>
      </div>
      {/* Filters */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          placeholder="Search by title or location"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={() => {
            setSearchTerm('');
            setFilterDate('');
          }}
          className="text-sm text-blue-600 underline"
        >
          Clear Filters
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow space-y-4">
        {filteredEvents.length === 0 && <p className="text-gray-500">No events match your criteria.</p>}
        {filteredEvents.map(event => (
          <div key={event.id} className="border border-gray-200 p-4 rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-blue-600">{event.title}</h3>
                <p className="text-sm text-gray-600">
                    {event.date} at {formatTime12Hour(event.time)} • {event.location} • {event.capacity} spots
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Status: <span className={
                      getEventStatus(event.date, event.time) === 'Upcoming' ? 'text-green-600' :
                      getEventStatus(event.date, event.time) === 'Ongoing' ? 'text-yellow-600' :
                      'text-red-600'
                    }>
                      {getEventStatus(event.date, event.time)}
                    </span>
                  </p>
                <p className="text-sm mt-1 text-gray-500">{event.description}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => openModal(event)}
                  className="text-sm bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500"
                >Edit</button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl relative">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              {isEdit ? 'Edit Event' : 'Add Event'}
            </h2>
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-xl"
              onClick={() => setIsModalOpen(false)}
            >×</button>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className="p-2 border rounded"
                required
              />
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="p-2 border rounded"
                required
              />
              <input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Capacity"
                value={form.capacity}
                onChange={e => setForm({ ...form, capacity: e.target.value })}
                className="p-2 border rounded"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="p-2 border rounded md:col-span-2"
                rows={3}
                required
              />
              <button
                type="submit"
                className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >{isEdit ? 'Update' : 'Add'} Event</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;