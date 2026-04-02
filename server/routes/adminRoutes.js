const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const { updateAdminResponsibility, getAdminByUserId, getAllAdmins } = require('../models/adminModel');

// Route
router.get('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const admin = await getAdminByUserId(userId);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching admin' });
  }
});

//read all 
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const admins = await getAllAdmins();
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching admins' });
  }
});


router.put('/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  const { responsibility } = req.body;

  if (isNaN(userId) || typeof responsibility !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    await updateAdminResponsibility(userId, responsibility);
    res.json({ message: 'Admin responsibility updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating admin responsibility' });
  }
});

module.exports = router;

