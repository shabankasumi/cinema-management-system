const bcrypt = require('bcrypt');

async function hashPassword(password, saltRounds = 12) {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('Error hashing password: ' + error.message);
  }
}

async function comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('Error comparing passwords: ' + error.message);
  }
}

function validatePasswordStrength(password) {
  const errors = [];
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}



module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};
