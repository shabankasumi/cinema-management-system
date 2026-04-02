const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');

const router = express.Router();

const {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema
} = require('../models/cinemaModel');

// funksion per validimin 
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// CREATE
router.post(
  '/',authenticateToken, requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const { name, city } = req.body;
    await createCinema({name, city});
    res.status(201).json({ message: 'Cinema created successfully' });
  })
);

// READ ALL
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const cinemas = await getAllCinemas();
    res.json({ data: cinemas });
  })
);

// READ BY ID
router.get(
  '/:id',
  [
    param('id').isInt({ gt: 0 }).withMessage('Cinema ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const cinemaID = parseInt(req.params.id, 10);
    const cinema = await getCinemaById(cinemaID);
    if (!cinema) {
      return res.status(404).json({ error: 'Cinema not found' });
    }
    res.json({ data: cinema });
  })
);

// UPDATE
router.put(
  '/:id',authenticateToken, requireAdmin,
  [
    param('id').isInt({ gt: 0 }).withMessage('Cinema ID must be a positive integer'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const cinemaID = parseInt(req.params.id, 10);
    const { name, city } = req.body;
    await updateCinema(cinemaID, name, city);
    res.json({ message: 'Cinema updated successfully' });
  })
);

// DELETE
router.delete(
  '/:id',authenticateToken, requireAdmin,
  [
    param('id').isInt({ gt: 0 }).withMessage('Cinema ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const cinemaID = parseInt(req.params.id, 10);
    await deleteCinema(cinemaID);
    res.json({ message: 'Cinema deleted successfully' });
  })
);

module.exports = router;
