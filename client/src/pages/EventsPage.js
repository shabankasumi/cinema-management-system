import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI } from '../services/api';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getAll();
      const allEvents = Array.isArray(response.data) ? response.data : [];
      setEvents(allEvents.filter((event) => event.status === 'Active'));
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = useMemo(() => {
    let updatedEvents = [...events];

    // SEARCH
    if (searchTerm.trim()) {
      updatedEvents = updatedEvents.filter((event) =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // SORT / FILTER
    if (sortBy === 'title-asc') {
      updatedEvents.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'title-desc') {
      updatedEvents.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'price-low') {
      updatedEvents.sort(
        (a, b) => Number(a.ticketPrice || 0) - Number(b.ticketPrice || 0)
      );
    } else if (sortBy === 'price-high') {
      updatedEvents.sort(
        (a, b) => Number(b.ticketPrice || 0) - Number(a.ticketPrice || 0)
      );
    }

    return updatedEvents;
  }, [events, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
        Loading events...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Movie Events
        </h1>

        {/* SEARCH + FILTER */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-dark-800 text-white border border-dark-700 rounded-lg px-4 py-3 outline-none focus:border-primary-500"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-dark-800 text-white border border-dark-700 rounded-lg px-4 py-3 outline-none focus:border-primary-500"
          >
            <option value="default">Default</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="price-low">Price Low to High</option>
            <option value="price-high">Price High to Low</option>
          </select>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400">No events found</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.eventId}
                className="bg-dark-800 rounded-xl overflow-hidden shadow-lg hover:scale-[1.02] transition"
              >
                <img
                  src={event.posterPath}
                  alt={event.title}
                  className="w-full h-80 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-xl font-bold text-white mb-2">
                    {event.title}
                  </h2>

                  <p className="text-yellow-400 font-semibold text-lg mb-4">
                    €{Number(event.ticketPrice || 0).toFixed(2)}
                  </p>

                  <Link
                    to={`/reservations/${event.eventId}`}
                    className="block w-full text-center bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold"
                  >
                    Reserve Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;