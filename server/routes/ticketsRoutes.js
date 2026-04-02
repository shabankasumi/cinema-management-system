const express = require('express');
const router = express.Router();
const ticketsModel = require('../models/ticketsModel');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');

// READ ALL
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const tickets = await ticketsModel.getAllTickets();
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching all tickets:', err);
    res.status(500).json({ error: err.message });
  }
});

// READ CLIENT TICKETS
router.get('/my', authenticateToken, requireUser, async (req, res) => {
  try {
    const tickets = await ticketsModel.getTicketsByClientName(req.user.username);
    res.json(tickets);
  } catch (err) {
    console.error('Error fetching my tickets:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;