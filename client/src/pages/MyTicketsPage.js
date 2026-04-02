import React, { useEffect, useState } from 'react';
import { ticketsAPI } from '../services/api';
import { toast } from 'react-toastify';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await ticketsAPI.getMine();
      setTickets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">My Tickets</h1>
          <p className="text-gray-400">View all your booked movie event tickets</p>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-dark-800 rounded-2xl p-10 text-center">
            <p className="text-gray-400 text-lg">You do not have any tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {tickets.map((ticket) => (
              <TicketCard key={ticket.ticketId} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TicketCard = ({ ticket }) => {
  const formattedDate = ticket.eventDate
    ? new Date(ticket.eventDate).toLocaleDateString()
    : '-';

  const formattedTime = ticket.eventTime
    ? String(ticket.eventTime).slice(0, 5)
    : '-';

  return (
    <div className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 rounded-3xl shadow-2xl overflow-hidden border border-primary-400/20">
      <div className="absolute top-0 bottom-0 left-[68%] w-px border-l-2 border-dashed border-white/30 hidden md:block" />

      <div className="grid grid-cols-1 md:grid-cols-[2fr_auto_1fr]">
        {/* Main Left */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-primary-100 text-sm uppercase tracking-[0.3em] mb-2">
                Cinema Ticket
              </p>
              <h2 className="text-3xl font-bold text-white">
                {ticket.eventTitle}
              </h2>
            </div>

            <div className="bg-white/15 px-4 py-2 rounded-full">
              <span className="text-white text-sm font-semibold">
                #{ticket.ticketId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <InfoItem label="Date" value={formattedDate} />
            <InfoItem label="Time" value={formattedTime} />
            <InfoItem label="Hall" value={ticket.hallName || '-'} />
            <InfoItem label="Seat" value={`#${ticket.seatNumber}`} />
            <InfoItem label="Status" value={ticket.status || 'Active'} />
            <InfoItem label="Reservation" value={`#${ticket.reservationId}`} />
          </div>
        </div>

        {/* Perforation dots */}
        <div className="hidden md:flex flex-col justify-between items-center py-4">
          <div className="w-8 h-8 bg-dark-900 rounded-full -translate-x-1/2" />
          <div className="w-8 h-8 bg-dark-900 rounded-full -translate-x-1/2" />
        </div>

        {/* Right Stub */}
        <div className="bg-black/10 p-8 flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 11h10M7 15h6m-9 5h16a2 2 0 002-2V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-white font-bold text-lg mb-1">Admit One</p>
          <p className="text-primary-100 text-sm mb-4">{ticket.eventTitle}</p>

          <div className="bg-white text-primary-800 font-bold px-4 py-2 rounded-xl">
            Seat {ticket.seatNumber}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-primary-100 text-xs uppercase tracking-wider mb-1">{label}</p>
    <p className="text-white font-semibold text-lg">{value}</p>
  </div>
);

export default MyTicketsPage;