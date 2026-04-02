const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

//  function to validate request
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
}

//  function to generate tokens
function generateTokens(payload) {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });

  return { accessToken, refreshToken };
}

//  function to store refresh token in database
async function storeRefreshToken(userId, refreshToken) {
  try {
    await sql.connect(dbConfig);

    // First, invalidate any existing refresh tokens for this user
    await new sql.Request()
      .input('userId', sql.Int, userId)
      .query('DELETE FROM RefreshTokens WHERE userId = @userId');

    // Store the new refresh token
    await new sql.Request()
      .input('userId', sql.Int, userId)
      .input('token', sql.NVarChar, refreshToken)
      .input('expiresAt', sql.DateTime, new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))) // 7 days
      .input('createdAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO RefreshTokens (userId, token, expiresAt, createdAt)
        VALUES (@userId, @token, @expiresAt, @createdAt)
      `);
  } catch (error) {
    console.error('Error storing refresh token:', error);
    throw error;
  }
}

// REGISTER USER
router.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('password')
    .exists({ checkFalsy: true })
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['Admin', 'Client'])
    .withMessage('Role must be either Admin or Client'),
  body('phoneNumber')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  validateRequest
], async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      password,
      gender,
      date_of_birth,
      address,
      zipCode,
      city,
      phoneNumber,
      role = 'Client', // Default to Client
      cinemaId
    } = req.body;

    await sql.connect(dbConfig);

    // Check if username already exists
    const existingUser = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .query('SELECT userId FROM Users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Validate password exists
    const passwordRaw = password;
    if (!passwordRaw) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }
    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const passwordBuffer = Buffer.from(hashedPassword, 'utf-8');

    // Create the user
    const insertResult = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('gender', sql.NVarChar, gender)
      .input('date_of_birth', sql.Date, date_of_birth)
      .input('address', sql.NVarChar, address)
      .input('zipCode', sql.NVarChar, zipCode)
      .input('city', sql.NVarChar, city)
      .input('phoneNumber', sql.NVarChar, phoneNumber)
      .input('passwordHash', sql.VarBinary, passwordBuffer)
      .input('role', sql.NVarChar, role)
      .input('cinemaId', sql.Int, cinemaId)
      .input('createdAt', sql.DateTime, new Date())
      .query(`
        INSERT INTO Users 
          (username, firstName, lastName, gender, date_of_birth, address, zipCode, city, phoneNumber, passwordHash, role, cinemaId, createdAt)
        VALUES
          (@username, @firstName, @lastName, @gender, @date_of_birth, @address, @zipCode, @city, @phoneNumber, @passwordHash, @role, @cinemaId, @createdAt);
        SELECT SCOPE_IDENTITY() AS userId;
      `);

    const userId = insertResult.recordset[0].userId;

    // Create role-specific record
    if (role === 'Admin') {
      await new sql.Request()
        .input('userId', sql.Int, userId)
        .query(`INSERT INTO Admin (responsibility, userId) VALUES ('Default Responsibility', @userId)`);
    } else if (role === 'Client') {
      await new sql.Request()
        .input('userId', sql.Int, userId)
        .query(`INSERT INTO Client (status, userId) VALUES ('Active', @userId)`);
    }

    // Generate tokens
    const tokenPayload = { userId, username, role };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    // Store refresh token
    await storeRefreshToken(userId, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          userId,
          username,
          firstName,
          lastName,
          role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// LOGIN USER
router.post('/login', [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
], async (req, res) => {
  try {
    const { username, password } = req.body;

    await sql.connect(dbConfig);

    // Find user by username
    const userResult = await new sql.Request()
      .input('username', sql.NVarChar, username)
      .query('SELECT userId, username, firstName, lastName, passwordHash, role FROM Users WHERE username = @username');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const user = userResult.recordset[0];

    // Compare password
    const storedPassword = user.passwordHash.toString('utf-8');
    const isPasswordValid = await bcrypt.compare(password, storedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role
    };
    const { accessToken, refreshToken } = generateTokens(tokenPayload);

    // Store refresh token
    await storeRefreshToken(user.userId, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// REFRESH TOKEN
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
  validateRequest
], async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    await sql.connect(dbConfig);

    // Check if refresh token exists in database and is not expired
    const tokenResult = await new sql.Request()
      .input('userId', sql.Int, decoded.userId)
      .input('token', sql.NVarChar, refreshToken)
      .query(`
        SELECT * FROM RefreshTokens 
        WHERE userId = @userId AND token = @token AND expiresAt > GETDATE()
      `);

    if (tokenResult.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Get current user data
    const userResult = await new sql.Request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT userId, username, firstName, lastName, role FROM Users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.recordset[0];

    // Generate new tokens
    const tokenPayload = {
      userId: user.userId,
      username: user.username,
      role: user.role
    };
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(tokenPayload);

    // Store new refresh token
    await storeRefreshToken(user.userId, newRefreshToken);

    res.json({
      success: true,
      message: 'Tokens refreshed successfully',
      data: {
        user: {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during token refresh'
    });
  }
});

// LOGOUT
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await sql.connect(dbConfig);

    // Remove refresh token from database
    await new sql.Request()
      .input('userId', sql.Int, req.user.userId)
      .query('DELETE FROM RefreshTokens WHERE userId = @userId');

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout'
    });
  }
});

// GET CURRENT USER (Protected route example)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    await sql.connect(dbConfig);

    const userResult = await new sql.Request()
      .input('userId', sql.Int, req.user.userId)
      .query(`
        SELECT userId, username, firstName, lastName, gender, date_of_birth, 
               address, zipCode, city, phoneNumber, role, cinemaId, createdAt, updatedAt
        FROM Users 
        WHERE userId = @userId
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.recordset[0];

    res.json({
      success: true,
      data: {
        userId: user.userId,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        address: user.address,
        zipCode: user.zipCode,
        city: user.city,
        phoneNumber: user.phoneNumber,
        role: user.role,
        cinemaId: user.cinemaId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
