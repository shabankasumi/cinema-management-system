import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, reservationsAPI } from '../services/api';
import { toast } from 'react-toastify';

const ReservationPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [reservedSeats, setReservedSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [eventRes, seatsRes] = await Promise.all([
        eventsAPI.getById(eventId),
        reservationsAPI.getReservedSeats(eventId),
      ]);

      setEvent(eventRes.data);
      setReservedSeats(Array.isArray(seatsRes.data) ? seatsRes.data : []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load reservation page');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleReserve = async () => {
    if (!selectedSeat) {
      toast.error('Please select a seat');
      return;
    }

    try {
      setSubmitting(true);

      await reservationsAPI.create({
        eventId: Number(eventId),
        seatNumber: selectedSeat,
      });

      toast.success('Reservation created successfully!');
      navigate('/events');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to create reservation');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center text-white">
        Event not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-dark-800 rounded-2xl p-6">
          <div>
            <img
              src={event.posterPath}
              alt={event.title}
              className="w-full h-[520px] object-cover rounded-xl"
            />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white mb-4">{event.title}</h1>

            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                <span className="text-white font-semibold">Date:</span>{' '}
                {event.date ? new Date(event.date).toLocaleDateString() : ''}
              </p>

              <p className="text-gray-300">
                <span className="text-white font-semibold">Time:</span>{' '}
                {event.time ? String(event.time).slice(0, 5) : ''}
              </p>

              <p className="text-gray-300">
                <span className="text-white font-semibold">Hall:</span> {event.hallName}
              </p>

              <p className="text-yellow-400 font-bold text-2xl">
                €{Number(event.ticketPrice || 0).toFixed(2)}
              </p>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">Select One Seat</h2>

            <div className="grid grid-cols-5 sm:grid-cols-6 gap-3 mb-6">
              {Array.from({ length: event.maxTickets || 0 }, (_, i) => {
                const seat = i + 1;
                const isReserved = reservedSeats.includes(seat);
                const isSelected = selectedSeat === seat;

                return (
                  <button
                    key={seat}
                    type="button"
                    disabled={isReserved}
                    onClick={() => setSelectedSeat(seat)}
                    className={`py-3 rounded-lg font-semibold transition ${
                      isReserved
                        ? 'bg-red-600 text-white cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {seat}
                  </button>
                );
              })}
            </div>

            <div className="mb-6 text-sm text-gray-300 space-y-1">
              <p>
                <span className="inline-block w-4 h-4 bg-green-600 rounded mr-2"></span>
                Available
              </p>
              <p>
                <span className="inline-block w-4 h-4 bg-red-600 rounded mr-2"></span>
                Reserved
              </p>
              <p>
                <span className="inline-block w-4 h-4 bg-blue-600 rounded mr-2"></span>
                Selected
              </p>
            </div>

            {selectedSeat && (
              <p className="text-white mb-4">
                Selected seat:{' '}
                <span className="font-bold text-primary-400">{selectedSeat}</span>
              </p>
            )}

            <button
              onClick={handleReserve}
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold"
            >
              {submitting ? 'Creating Reservation...' : 'Confirm Reservation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPage;