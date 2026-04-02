
const sql = require('mssql/msnodesqlv8');
const dbConfig = require('../config/db');

async function updateClientStatus(userId, status) {
  try {
    await sql.connect(dbConfig);
    await new sql.Request()
      .input("userId", sql.Int, userId)
      .input("status", sql.NVarChar, status)
      .query("UPDATE Client SET status = @status WHERE userId = @userId");

    return { message: "Client updated successfully" };
  } catch (err) {
    console.error("Error updating client:", err);
    throw err;
  }
}

//read
async function getAllClients() {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .query("SELECT * FROM Client");

    return result.recordset;
  } catch (err) {
    console.error("Error fetching all clients:", err);
    throw err;
  }
}


async function getClientByUserId(userId) {
  try {
    await sql.connect(dbConfig);
    const result = await new sql.Request()
      .input("userId", sql.Int, userId)
      .query("SELECT * FROM Client WHERE userId = @userId");

    return result.recordset[0] || null;
  } catch (err) {
    console.error("Error fetching client:", err);
    throw err;
  }
}

module.exports = {
  updateClientStatus,
  getAllClients,
  getClientByUserId
};

