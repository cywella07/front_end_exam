import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const Event = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    // Simulate fetching event by ID
    const sampleEvents = [
      {
        id: 1,
        title: 'React for Beginners',
        date: '2025-04-10',
        time: '09:00',
        location: 'Hall A',
        capacity: 5,
        booked: 3,
        description: 'Learn the basics of React.js in this introductory workshop.'
      },
      {
        id: 2,
        title: 'Advanced Laravel',
        date: '2025-04-12',
        time: '13:00',
        location: 'Hall B',
        capacity: 10,
        booked: 10,
        description: 'Deep dive into Laravel for building powerful backends.'
      }
    ];

    const found = sampleEvents.find(e => e.id === parseInt(id));
    setEvent(found);
  }, [id]);

  const handleReserve = () => {
    if (event.booked >= event.capacity || reserved) return;
    setReserved(true);
    setEvent({ ...event, booked: event.booked + 1 });
  };

  if (!event) return <div className="p-6 text-gray-500">Loading event details...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">{event.title}</h1>
        <p className="text-sm text-gray-600 mb-4">
          {event.date} at {event.time} • {event.location}
        </p>
        <p className="text-gray-700 mb-4">{event.description}</p>
        <p className="text-sm text-gray-600 mb-4">
          {event.booked}/{event.capacity} spots reserved
        </p>

        {event.booked >= event.capacity ? (
          <span className="text-red-500 font-semibold">This event is fully booked.</span>
        ) : reserved ? (
          <span className="text-green-600 font-semibold">You have successfully reserved a spot!</span>
        ) : (
          <button
            onClick={handleReserve}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reserve Spot
          </button>
        )}

        <div className="mt-6">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            ← Back to Events
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Event;