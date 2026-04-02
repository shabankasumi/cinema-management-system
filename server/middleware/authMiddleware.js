const jwt = require('jsonwebtoken');
const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await sql.connect(dbConfig);
    const userResult = await new sql.Request()
      .input('userId', sql.Int, decoded.userId)
      .query('SELECT userId, username, role FROM Users WHERE userId = @userId');

    if (userResult.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    // Vendos user info nga DB, jo nga token
    const user = userResult.recordset[0];
    req.user = {
      userId: user.userId,
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(403).json({ success: false, message: 'Invalid token' });
    if (error.name === 'TokenExpiredError') return res.status(403).json({ success: false, message: 'Token expired' });

    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: `Access denied. Required roles: ${roles.join(', ')}` });
  next();
};

const requireAdmin = authorize('Admin');
const requireUser = authorize('Admin', 'Client');

module.exports = { authenticateToken, authorize, requireAdmin, requireUser };