
const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function updateAdminResponsibility(userId, responsibility) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input("userId", sql.Int, userId)
      .input("responsibility", sql.NVarChar, responsibility)
      .query("UPDATE Admin SET responsibility = @responsibility WHERE userId = @userId");

    return { message: "Admin updated successfully" };
  } catch (err) {
    console.error("Error updating admin:", err);
    throw err;
  }
}

//READ
async function getAllAdmins() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query("SELECT * FROM Admin");

    return result.recordset;
  } catch (err) {
    console.error("Error fetching all admins:", err);
    throw err;
  }
}

async function getAdminByUserId(userId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Admin WHERE userId = @userId");

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Error fetching admin:", err);
    throw err;
  }
}

module.exports = {
  updateAdminResponsibility,
  getAllAdmins,
  getAdminByUserId
};

