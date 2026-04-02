const express = require('express');
const router = express.Router();

const reservationModel = require('../models/reservationModel');
const ticketsModel = require('../models/ticketsModel');
const eventsModel = require('../models/eventsModel');

const {
  authenticateToken,
  requireUser
} = require('../middleware/authMiddleware');

// GET RESERVED SEATS FOR EVENT
router.get('/event/:eventId/seats', authenticateToken, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const seats = await reservationModel.getReservedSeatsByEvent(eventId);
    res.json(seats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE RESERVATION + AUTO CREATE TICKET
router.post('/', authenticateToken, requireUser, async (req, res) => {
  try {
    const user = req.user;
    const { eventId, seatNumber } = req.body;

    if (!eventId) {
      return res.status(400).json({ error: 'eventId is required' });
    }

    if (!seatNumber) {
      return res.status(400).json({ error: 'seatNumber is required' });
    }

    const event = await eventsModel.getEventById(eventId);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.status !== 'Active') {
      return res.status(400).json({ error: 'Event is not active' });
    }

    if (seatNumber < 1 || seatNumber > event.maxTickets) {
      return res.status(400).json({ error: 'Invalid seat number' });
    }

    const reservation = await reservationModel.createReservation({
      clientId: user.userId,
      eventId,
      seatNumber,
      createdBy: user.username
    });

    const ticket = await ticketsModel.createTicket({
      reservationId: reservation.reservationId,
      clientName: user.username,
      eventTitle: event.title,
      eventDate: event.date,
      eventTime: event.time,
      hallName: event.hallName,
      seatNumber,
      status: 'Active'
    });

    await eventsModel.incrementBookedTickets(eventId, 1);

    res.status(201).json({
      message: 'Reservation and ticket created successfully',
      reservation,
      ticket
    });
  } catch (err) {
    if (err.number === 2627 || err.number === 2601) {
      return res.status(400).json({ error: 'This seat is already reserved' });
    }

    console.error('Reservation route error:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ RESERVATIONS
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

    let data;
    if (user.role === 'Admin') {
      data = await reservationModel.getAllReservations();
    } else {
      data = await reservationModel.getReservationsByClient(user.userId);
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE RESERVATION
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const reservationId = parseInt(req.params.id);

    const reservation = await reservationModel.getReservationById(reservationId);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (user.role !== 'Admin' && reservation.clientId !== user.userId) {
      return res.status(403).json({ error: 'You are not allowed to view this reservation' });
    }

    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE RESERVATION
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const reservationId = parseInt(req.params.id);

    const reservation = await reservationModel.getReservationById(reservationId);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (user.role !== 'Admin' && reservation.clientId !== user.userId) {
      return res.status(403).json({ error: 'You are not allowed to delete this reservation' });
    }

    await reservationModel.deleteReservation(reservationId);
    await eventsModel.decrementBookedTickets(reservation.eventId, 1);

    res.json({ message: 'Reservation + Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;