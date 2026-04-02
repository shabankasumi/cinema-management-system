const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const { authenticateToken, requireAdmin, requireUser } = require('../middleware/authMiddleware');

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require('../models/usersModel');

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

// CREATE USER - Admin only
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  [
    body('username').trim().notEmpty().withMessage('Username is required'), // added username validation
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('gender').trim().notEmpty().withMessage('Gender is required'),
    body('date_of_birth').isISO8601().toDate().withMessage('Valid date_of_birth is required'),
    body('address').optional().trim(),
    body('zipCode').optional().trim(),
    body('city').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('passwordHash').notEmpty().withMessage('PasswordHash is required'),
    body('role')
      .notEmpty().withMessage('Role is required')
      .isIn(['Admin', 'Client']).withMessage('Role must be Admin or Client'),
    body('cinemaId').optional().isInt({ gt: 0 }).withMessage('CinemaId must be a positive integer'),
    body('createdBy').optional().trim(),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const user = req.body;
    const result = await createUser(user);
    res.status(201).json({
      message: result.message,
      userId: result.userId
    });
  })
);

// READ ALL USERS
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const users = await getAllUsers();
    res.json({ data: users });
  })
);

// READ USER BY ID - Authenticated users
router.get(
  '/:id',
  authenticateToken,
  requireUser,
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ data: user });
  })
);

// UPDATE USER - Admin only
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    body('username').optional().trim(), // allow username update
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('gender').optional().trim(),
    body('date_of_birth').optional().isISO8601().toDate(),
    body('address').optional().trim(),
    body('zipCode').optional().trim(),
    body('city').optional().trim(),
    body('phoneNumber').optional().trim(),
    body('passwordHash').optional().notEmpty(),
    body('role').optional().isIn(['Admin', 'Client']).withMessage('Role must be Admin or Client'),
    body('updatedBy').optional().trim(),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userData = req.body;
    await updateUser(id, userData);
    res.status(200).json({ message: 'User updated successfully' });
  })
);

// DELETE USER - Admin only
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  [
    param('id').isInt({ gt: 0 }).withMessage('User ID must be a positive integer'),
    validateRequest
  ],
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    await deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  })
);

module.exports = router;

