import React, { useState, useEffect, useMemo } from 'react';
import { eventsAPI, moviesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');

  const [formData, setFormData] = useState({
    movieId: '',
    description: '',
    date: '',
    time: '',
    hallName: '',
    maxTickets: '',
    ticketPrice: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchEvents();
    fetchMovies();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await eventsAPI.getAll();
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await moviesAPI.getAll();
      setMovies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error('Failed to fetch movies');
    }
  };

  const resetForm = () => {
    setFormData({
      movieId: '',
      description: '',
      date: '',
      time: '',
      hallName: '',
      maxTickets: '',
      ticketPrice: '',
      status: 'Active',
    });
    setEditingEvent(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (event) => {
    const matchedMovie = movies.find(
      (movie) => movie.title === event.title || movie.posterPath === event.posterPath
    );

    setFormData({
      movieId: matchedMovie?.movieId || '',
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      time: event.time ? String(event.time).slice(0, 5) : '',
      hallName: event.hallName || '',
      maxTickets: event.maxTickets || '',
      ticketPrice: event.ticketPrice || '',
      status: event.status || 'Active',
    });

    setEditingEvent(event);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedMovie = movies.find(
      (movie) => String(movie.movieId) === String(formData.movieId)
    );

    if (!selectedMovie) {
      toast.error('Please select a movie');
      return;
    }

    const eventData = {
      title: selectedMovie.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      hallName: formData.hallName,
      maxTickets: parseInt(formData.maxTickets, 10),
      ticketPrice: parseFloat(formData.ticketPrice),
      posterPath: selectedMovie.posterPath || null,
      status: formData.status,
      createdBy: 'Admin',
      updatedBy: 'Admin',
    };

    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent.eventId, eventData);
        toast.success('Event updated successfully!');
      } else {
        await eventsAPI.create(eventData);
        toast.success('Event created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.delete(eventId);
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const filteredEvents = useMemo(() => {
    let updatedEvents = [...events];

    if (searchTerm.trim()) {
      updatedEvents = updatedEvents.filter((event) =>
        event.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      updatedEvents = updatedEvents.filter(
        (event) => event.status === statusFilter
      );
    }

    if (sortBy === 'title-asc') {
      updatedEvents.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'title-desc') {
      updatedEvents.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else if (sortBy === 'date-newest') {
      updatedEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === 'date-oldest') {
      updatedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
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
  }, [events, searchTerm, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Events</h1>
          <button
            onClick={handleAdd}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add Event
          </button>
        </div>

        {/* SEARCH + FILTER + SORT */}
        <div className="bg-dark-800 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by movie title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white outline-none focus:border-primary-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white outline-none focus:border-primary-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white outline-none focus:border-primary-500"
            >
              <option value="default">Default</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="date-newest">Newest Date</option>
              <option value="date-oldest">Oldest Date</option>
              <option value="price-low">Price Low to High</option>
              <option value="price-high">Price High to Low</option>
            </select>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Movie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Hall</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Max Tickets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ticket Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-dark-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                      No events found
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.eventId} className="hover:bg-dark-700">
                      <td className="px-6 py-4 text-white flex items-center gap-3">
                        {event.posterPath ? (
                          <img
                            src={event.posterPath}
                            alt={event.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-dark-600 rounded" />
                        )}
                        <span>{event.title}</span>
                      </td>

                      <td className="px-6 py-4 text-gray-300">
                        {event.date ? new Date(event.date).toLocaleDateString() : ''}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {event.time ? String(event.time).slice(0, 5) : ''}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{event.hallName}</td>
                      <td className="px-6 py-4 text-gray-300">{event.maxTickets}</td>
                      <td className="px-6 py-4 text-yellow-400 font-semibold">
                        €{Number(event.ticketPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{event.status}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(event)}
                          className="text-blue-400 hover:text-blue-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(event.eventId)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                {editingEvent ? 'Edit Event' : 'Add Event'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <select
                  required
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.movieId}
                  onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                >
                  <option value="">Select movie</option>
                  {movies.map((movie) => (
                    <option key={movie.movieId} value={movie.movieId}>
                      {movie.title}
                    </option>
                  ))}
                </select>

                <textarea
                  rows="3"
                  placeholder="Description"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />

                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />

                <input
                  type="text"
                  required
                  placeholder="Hall Name"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.hallName}
                  onChange={(e) => setFormData({ ...formData, hallName: e.target.value })}
                />

                <input
                  type="number"
                  min="1"
                  required
                  placeholder="Max Tickets"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.maxTickets}
                  onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
                />

                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  placeholder="Ticket Price"
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.ticketPrice}
                  onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                />

                <select
                  className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-dark-600 text-white rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;