import React, { useState, useEffect } from 'react';
import { reservationsAPI, eventsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [reservationsRes, eventsRes] = await Promise.all([
        reservationsAPI.getAll(),
        eventsAPI.getAll()
      ]);

      setReservations(Array.isArray(reservationsRes.data) ? reservationsRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
    } catch (error) {
      toast.error('Failed to fetch reservations');
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reservationId, seatNumber) => {
    if (window.confirm(`Are you sure you want to delete reservation for seat ${seatNumber}?`)) {
      try {
        await reservationsAPI.delete(reservationId);
        toast.success('Reservation deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete reservation.');
        console.error('Error:', error);
      }
    }
  };

  const getEventTitle = (eventId) => {
    const event = events.find((e) => Number(e.eventId) === Number(eventId));
    return event ? event.title : `Event #${eventId}`;
  };

  const getEventHall = (eventId) => {
    const event = events.find((e) => Number(e.eventId) === Number(eventId));
    return event ? event.hallName : '-';
  };

  const getEventDate = (eventId) => {
    const event = events.find((e) => Number(e.eventId) === Number(eventId));
    return event?.date ? new Date(event.date).toLocaleDateString() : '-';
  };

  const getEventTime = (eventId) => {
    const event = events.find((e) => Number(e.eventId) === Number(eventId));
    return event?.time ? String(event.time).slice(0, 5) : '-';
  };

  const filteredReservations = reservations.filter((reservation) => {
    const eventTitle = getEventTitle(reservation.eventId).toLowerCase();

    return (
      reservation.reservationId?.toString().includes(searchTerm) ||
      reservation.clientId?.toString().includes(searchTerm) ||
      reservation.eventId?.toString().includes(searchTerm) ||
      reservation.seatNumber?.toString().includes(searchTerm) ||
      eventTitle.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reservations Management</h1>
            <p className="text-gray-400">View and manage customer reservations</p>
          </div>
          <div className="bg-dark-800 px-4 py-2 rounded-lg">
            <span className="text-gray-400 text-sm">Total Reservations: </span>
            <span className="text-white font-semibold">{reservations.length}</span>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Search Reservations
          </label>
          <input
            type="text"
            placeholder="Search by reservation ID, client ID, event, or seat..."
            className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-dark-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
              <thead className="bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reservation ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Movie / Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Seat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-dark-800 divide-y divide-dark-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                      Loading reservations...
                    </td>
                  </tr>
                ) : filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-400">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.reservationId}
                      className="hover:bg-dark-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        #{reservation.reservationId}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {getEventTitle(reservation.eventId)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Hall: {getEventHall(reservation.eventId)}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-600 text-white">
                          Seat {reservation.seatNumber}
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getEventDate(reservation.eventId)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getEventTime(reservation.eventId)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">Client #{reservation.clientId}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {reservation.createdBy || '-'}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleDelete(reservation.reservationId, reservation.seatNumber)
                          }
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Reservation"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-400">Total Reservations</p>
            <p className="text-2xl font-bold text-white mt-2">{reservations.length}</p>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-400">Reserved Seats</p>
            <p className="text-2xl font-bold text-white mt-2">{reservations.length}</p>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <p className="text-sm font-medium text-gray-400">Unique Clients</p>
            <p className="text-2xl font-bold text-white mt-2">
              {[...new Set(reservations.map((r) => r.clientId))].length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;