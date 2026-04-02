
const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');


const { updateClientStatus, getClientByUserId, getAllClients } = require('../models/clientModel');




router.put('/:userId',authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { status } = req.body;

  if (isNaN(userId) || typeof status !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    await updateClientStatus(userId, status);
    res.json({ message: 'Client status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating client status' });
  }
});

//read
router.get('/',authenticateToken, requireAdmin, async (req, res) => {
  try {
    const clients = await getAllClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching clients' });
  }
});


router.get('/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const client = await getClientByUserId(userId);
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching client' });
  }
});


module.exports = router;
