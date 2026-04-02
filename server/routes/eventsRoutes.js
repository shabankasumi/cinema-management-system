const express = require('express');
const router = express.Router();
const eventsModel = require('../models/eventsModel');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');


// CREATE 
router.post('/',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const eventData = req.body;
    const result = await eventsModel.createEvent(eventData);
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// READ ALL 
router.get('/', async (req, res) => {
  try {
    const events = await eventsModel.getAllEvents();
    res.json(events);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// READ BY ID 
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid eventId' });

    const event = await eventsModel.getEventById(eventId);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.json(event);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// UPDATE - PUT 
router.put('/:id',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid eventId' });

    const updates = req.body;
    const result = await eventsModel.updateEvent(eventId, updates);
    res.json(result);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// DELETE - DELETE 
router.delete('/:id',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    if (isNaN(eventId)) return res.status(400).json({ error: 'Invalid eventId' });

    const result = await eventsModel.deleteEvent(eventId);
    res.json(result);
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
